const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeStatus = (value) => {
  if (!value) {
    return null;
  }
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'completed') {
    return 'Completed';
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'Cancelled';
  }
  if (normalized === 'pending') {
    return 'Pending';
  }
  return null;
};

const isTransactionError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('Transaction numbers are only allowed') ||
    message.includes('replica set') ||
    message.includes('mongos')
  );
};

const applyProductAdjustments = async (order, nextStatus, session, log) => {
  for (const item of order.items) {
    const query = { _id: item.productId };
    let update = null;

    if (nextStatus === 'Completed') {
      query.reserved = { $gte: item.quantity };
      query.stock = { $gte: item.quantity };
      update = { $inc: { reserved: -item.quantity, stock: -item.quantity } };
    } else if (nextStatus === 'Cancelled') {
      query.reserved = { $gte: item.quantity };
      update = { $inc: { reserved: -item.quantity } };
    }

    const options = session ? { session } : undefined;
    const result = await Product.updateOne(query, update, options);

    if (!result || result.matchedCount === 0) {
      throw createHttpError(409, 'Unable to update stock for this order.');
    }

    if (log) {
      log.push(item);
    }
  }
};

const rollbackAdjustments = async (items, nextStatus) => {
  await Promise.all(
    items.map((item) => {
      if (nextStatus === 'Completed') {
        return Product.updateOne(
          { _id: item.productId },
          { $inc: { reserved: item.quantity, stock: item.quantity } }
        );
      }
      return Product.updateOne(
        { _id: item.productId },
        { $inc: { reserved: item.quantity } }
      );
    })
  );
};

const updateOrderWithTransaction = async (orderId, nextStatus) => {
  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw createHttpError(404, 'Order not found.');
      }

      if (order.status !== 'Pending') {
        throw createHttpError(400, 'Only pending orders can be updated.');
      }

      await applyProductAdjustments(order, nextStatus, session);

      order.status = nextStatus;
      order.completedAt = nextStatus === 'Completed' ? new Date() : null;
      await order.save({ session });
      updatedOrder = order;
    });
  } finally {
    session.endSession();
  }

  return updatedOrder;
};

const updateOrderWithoutTransaction = async (orderId, nextStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw createHttpError(404, 'Order not found.');
  }

  if (order.status !== 'Pending') {
    throw createHttpError(400, 'Only pending orders can be updated.');
  }

  const adjustmentLog = [];

  try {
    await applyProductAdjustments(order, nextStatus, null, adjustmentLog);

    const updateResult = await Order.updateOne(
      { _id: orderId, status: 'Pending' },
      {
        $set: {
          status: nextStatus,
          completedAt: nextStatus === 'Completed' ? new Date() : null
        }
      }
    );

    if (!updateResult || updateResult.matchedCount === 0) {
      throw createHttpError(409, 'Order status changed while processing.');
    }
  } catch (error) {
    if (adjustmentLog.length) {
      await rollbackAdjustments(adjustmentLog, nextStatus);
    }
    throw error;
  }

  return await Order.findById(orderId);
};

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load orders.' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order id.' });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load order.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const nextStatus = normalizeStatus(req.body?.status);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order id.' });
  }

  if (!nextStatus || nextStatus === 'Pending') {
    return res.status(400).json({ message: 'Status must be Completed or Cancelled.' });
  }

  try {
    let order;

    try {
      order = await updateOrderWithTransaction(id, nextStatus);
    } catch (error) {
      if (!isTransactionError(error)) {
        throw error;
      }
      order = await updateOrderWithoutTransaction(id, nextStatus);
    }

    return res.json(order);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || 'Failed to update order.' });
  }
});

module.exports = router;
