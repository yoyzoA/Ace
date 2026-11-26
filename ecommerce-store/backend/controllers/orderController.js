const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const DELIVERY_FEE = 5;
// Limits that stop fake or abusive orders without getting in a real customer's way.
const MAX_LINES = 20; // different products in one order
const MAX_QUANTITY = 10; // units of one product
const MAX_PENDING_PER_PHONE = 3; // undelivered orders for one phone number
const MAX_LENGTH = { name: 80, phone: 30, location: 300 };

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

    Object.entries(MAX_LENGTH).forEach(([field, max]) => {
      if (customer[field].length > max) {
        throw createHttpError(400, `Please shorten the ${field} (up to ${max} characters).`);
      }
    });

    const phoneDigits = customer.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      throw createHttpError(400, 'Please enter a valid phone number.');
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

    if (items.length > MAX_LINES) {
      throw createHttpError(400, `An order can hold up to ${MAX_LINES} different products.`);
    }

    if (items.some((item) => item.quantity > MAX_QUANTITY)) {
      throw createHttpError(
        400,
        `You can order up to ${MAX_QUANTITY} of each product online. For more, please call or WhatsApp us.`
      );
    }

    if (new Set(items.map((item) => item.productId)).size !== items.length) {
      throw createHttpError(400, 'Invalid cart items.');
    }

    // Same phone number with several orders still waiting: likely a mistake or abuse.
    const pendingForPhone = await Order.countDocuments({
      status: 'Pending',
      'customer.phone': customer.phone
    });
    if (pendingForPhone >= MAX_PENDING_PER_PHONE) {
      throw createHttpError(
        429,
        'You already have orders waiting to be delivered. Please call or WhatsApp us to add to them.'
      );
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
