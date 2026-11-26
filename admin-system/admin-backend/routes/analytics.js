const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

const formatDate = (date) => date.toISOString().slice(0, 10);

const buildDateRange = (days) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const dates = [];
  for (let i = 0; i < days; i += 1) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    dates.push(formatDate(next));
  }

  return { start, end, dates };
};

const getRevenueByDay = async (days) => {
  const { start, end, dates } = buildDateRange(days);
  const rows = await Order.aggregate([
    {
      $match: {
        status: 'Completed',
        completedAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const revenueMap = new Map(rows.map((row) => [row._id, row.revenue]));
  return dates.map((date) => ({ date, revenue: revenueMap.get(date) || 0 }));
};

const getTopProducts = async (since, limit = 6) =>
  Order.aggregate([
    { $match: { status: 'Completed', completedAt: { $gte: since } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $last: '$items.name' },
        image: { $last: '$items.image' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { quantity: -1, revenue: -1 } },
    { $limit: limit }
  ]);

// Available = stock minus units held by pending orders.
const AVAILABLE = { $subtract: [{ $ifNull: ['$stock', 0] }, { $ifNull: ['$reserved', 0] }] };
const SHOWN = { published: { $ne: false } };

const getCatalogHealth = async () => {
  const [counts] = await Product.aggregate([
    {
      $facet: {
        total: [{ $count: 'n' }],
        shown: [{ $match: SHOWN }, { $count: 'n' }],
        featured: [{ $match: { ...SHOWN, featured: true } }, { $count: 'n' }],
        noPhoto: [
          { $match: { ...SHOWN, $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] } },
          { $count: 'n' }
        ],
        outOfStock: [{ $match: SHOWN }, { $match: { $expr: { $lte: [AVAILABLE, 0] } } }, { $count: 'n' }],
        lowStock: [
          { $match: SHOWN },
          { $addFields: { available: AVAILABLE } },
          { $match: { available: { $gte: 1, $lte: 2 } } },
          { $sort: { available: 1, price: -1 } },
          { $limit: 8 },
          { $project: { name: 1, images: { $slice: ['$images', 1] }, available: 1, price: 1, category: 1 } }
        ]
      }
    }
  ]);
  const n = (key) => counts?.[key]?.[0]?.n || 0;
  return {
    total: n('total'),
    shown: n('shown'),
    hidden: n('total') - n('shown'),
    featured: n('featured'),
    noPhoto: n('noPhoto'),
    outOfStock: n('outOfStock'),
    lowStock: counts?.lowStock || []
  };
};

router.get('/summary', async (req, res) => {
  try {
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenueAgg,
      pendingValueAgg,
      revenue7,
      revenue30,
      topProducts,
      catalog
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Order.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { status: 'Pending' } },
        { $group: { _id: null, value: { $sum: '$total' } } }
      ]),
      getRevenueByDay(7),
      getRevenueByDay(30),
      getTopProducts(since30),
      getCatalogHealth()
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const revenueLast30 = revenue30.reduce((sum, day) => sum + day.revenue, 0);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      revenueLast30,
      averageOrderValue: completedOrders ? totalRevenue / completedOrders : 0,
      pendingValue: pendingValueAgg[0]?.value || 0,
      revenueByDay: {
        last7: revenue7,
        last30: revenue30
      },
      topProducts,
      catalog
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
