const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/admin/products', productRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/admin/brands', brandRoutes);
app.use('/admin/orders', orderRoutes);
app.use('/admin/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  const message =
    status === 400 ? 'Invalid request body.' : err.message || 'Server error.';

  return res.status(status).json({ message });
});

const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Admin backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start admin backend', error);
    process.exit(1);
  }
};

startServer();
