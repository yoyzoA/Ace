const express = require('express');
const Order = require('../models/Order');
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

router.get('/summary', async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenueAgg,
      revenue7,
      revenue30
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'Completed' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Order.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]),
      getRevenueByDay(7),
      getRevenueByDay(30)
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      revenueByDay: {
        last7: revenue7,
        last30: revenue30
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analytics.' });
  }
});

module.exports = router;
