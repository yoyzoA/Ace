const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const DELIVERY_FEE = 5;

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeString = (value) => (value ? String(value).trim() : '');

const normalizeQuantity = (value) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return null;
  }
  const quantity = Math.floor(numberValue);
  return quantity > 0 ? quantity : null;
};

const isTransactionError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('Transaction numbers are only allowed') ||
    message.includes('replica set') ||
    message.includes('mongos')
  );
};

const loadProducts = async (productIds, session) => {
  const query = Product.find({ _id: { $in: productIds } });
  if (session) {
    query.session(session);
  }
  const products = await query;
  const map = new Map();
  products.forEach((product) => {
    map.set(String(product._id), product);
  });
  return map;
};

const getAvailable = (product) => {
  const stock = Number(product?.stock ?? 0);
  const reserved = Number(product?.reserved ?? 0);
  if (!Number.isFinite(stock) || !Number.isFinite(reserved)) {
    return 0;
  }
  return Math.max(stock - reserved, 0);
};

const buildOrderItems = (cartItems, productMap) =>
  cartItems.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0] || '',
      brand: product.brand,
      category: product.category
    };
  });

const reserveItemsWithSession = async (cartItems, session) => {
  for (const item of cartItems) {
    const result = await Product.updateOne(
      {
        _id: item.productId,
        $expr: {
          $gte: [
            {
              $subtract: [
                { $ifNull: ['$stock', 0] },
                { $ifNull: ['$reserved', 0] }
              ]
            },
            item.quantity
          ]
        }
      },
      { $inc: { reserved: item.quantity } },
      { session }
    );

    if (!result || result.matchedCount === 0) {
      throw createHttpError(409, 'Insufficient stock for one or more items.');
    }
  }
};

const reserveItemsWithoutTransaction = async (cartItems, reservedLog) => {
  for (const item of cartItems) {
    const result = await Product.updateOne(
      {
        _id: item.productId,
        $expr: {
          $gte: [
            {
              $subtract: [
                { $ifNull: ['$stock', 0] },
                { $ifNull: ['$reserved', 0] }
              ]
            },
            item.quantity
          ]
        }
      },
      { $inc: { reserved: item.quantity } }
    );

    if (!result || result.matchedCount === 0) {
      throw createHttpError(409, 'Insufficient stock for one or more items.');
    }

    reservedLog.push(item);
  }
};

const rollbackReservations = async (reservedItems) => {
  await Promise.all(
    reservedItems.map((item) =>
      Product.updateOne(
        { _id: item.productId, reserved: { $gte: item.quantity } },
        { $inc: { reserved: -item.quantity } }
      )
    )
  );
};

const createOrderWithTransaction = async (payload) => {
  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const productMap = await loadProducts(payload.productIds, session);

      if (productMap.size !== payload.items.length) {
        throw createHttpError(400, 'One or more items are no longer available.');
      }

      payload.items.forEach((item) => {
        const product = productMap.get(item.productId);
        if (!product || getAvailable(product) < item.quantity) {
          throw createHttpError(409, 'Insufficient stock for one or more items.');
        }
      });

      await reserveItemsWithSession(payload.items, session);

      const orderItems = buildOrderItems(payload.items, productMap);
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const total = subtotal + DELIVERY_FEE;

      const order = await Order.create(
        [
          {
            customer: payload.customer,
            items: orderItems,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            total,
            paymentMethod: 'COD',
            status: 'Pending'
          }
        ],
        { session }
      );

      createdOrder = order[0];
    });
  } finally {
    session.endSession();
  }

  return createdOrder;
};

const createOrderWithoutTransaction = async (payload) => {
  const productMap = await loadProducts(payload.productIds);

  if (productMap.size !== payload.items.length) {
    throw createHttpError(400, 'One or more items are no longer available.');
  }

  payload.items.forEach((item) => {
    const product = productMap.get(item.productId);
    if (!product || getAvailable(product) < item.quantity) {
      throw createHttpError(409, 'Insufficient stock for one or more items.');
    }
  });

  const reservedLog = [];

  try {
    await reserveItemsWithoutTransaction(payload.items, reservedLog);

    const orderItems = buildOrderItems(payload.items, productMap);
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + DELIVERY_FEE;

    return await Order.create({
      customer: payload.customer,
      items: orderItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      paymentMethod: 'COD',
      status: 'Pending'
    });
  } catch (error) {
    if (reservedLog.length) {
      await rollbackReservations(reservedLog);
    }
    throw error;
  }
};

const createOrder = async (req, res) => {
  try {
    const customerInput = req.body?.customer || {};
    const customer = {
      name: normalizeString(customerInput.name),
      phone: normalizeString(customerInput.phone),
      location: normalizeString(customerInput.location)
    };

    if (!customer.name || !customer.phone || !customer.location) {
      throw createHttpError(400, 'Customer name, phone, and location are required.');
    }

    const itemsInput = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!itemsInput.length) {
      throw createHttpError(400, 'Cart items are required.');
    }

    const items = itemsInput
      .map((item) => ({
        productId: String(item.productId || '').trim(),
        quantity: normalizeQuantity(item.quantity)
      }))
      .filter((item) => item.productId && item.quantity);

    if (!items.length || items.length !== itemsInput.length) {
      throw createHttpError(400, 'Invalid cart items.');
    }

    const productIds = items.map((item) => {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        throw createHttpError(400, 'Invalid product id in cart.');
      }
      return item.productId;
    });

    const payload = {
      customer,
      items,
      productIds
    };

    let order;

    try {
      order = await createOrderWithTransaction(payload);
    } catch (error) {
      if (!isTransactionError(error)) {
        throw error;
      }
      order = await createOrderWithoutTransaction(payload);
    }

    return res.status(201).json({ orderId: order.id });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'Failed to place order.'
    });
  }
};

module.exports = {
  createOrder
};
