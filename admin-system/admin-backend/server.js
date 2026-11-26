const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require('./routes/uploads');
const { requireAuth } = require('./middleware/auth');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

const allowedOrigins = (process.env.ADMIN_CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Electron's packaged renderer loads via file:// and sends no Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
};
app.use(cors(corsOptions));
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.use('/admin/auth', authRoutes);
app.use('/admin/products', requireAuth, productRoutes);
app.use('/admin/categories', requireAuth, categoryRoutes);
app.use('/admin/brands', requireAuth, brandRoutes);
app.use('/admin/orders', requireAuth, orderRoutes);
app.use('/admin/analytics', requireAuth, analyticsRoutes);
app.use('/admin/uploads', requireAuth, uploadRoutes);

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
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      throw new Error('JWT_SECRET is missing or too short (use 32+ random characters).');
    }
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
    }

    await mongoose.connect(MONGODB_URI);
    // Only this computer can reach the admin server, not others on the same Wi-Fi.
    const HOST = process.env.HOST || '127.0.0.1';
    app.listen(PORT, HOST, () => {
      console.log(`Admin backend running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start admin backend', error);
    process.exit(1);
  }
};

startServer();
