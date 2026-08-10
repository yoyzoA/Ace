const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : [];

// Order placement is a mutating endpoint, so it stays restricted to our own frontend.
const restrictedCors = cors(
  allowedOrigins.length
    ? { origin: allowedOrigins, methods: ['POST', 'OPTIONS'], optionsSuccessStatus: 200 }
    : undefined
);

// The product catalog is public, read-only storefront data (same as what any visitor
// sees in a browser), so it's safe to allow any origin to read it. This also lets the
// frontend's build-time prerenderer and other tools fetch the catalog directly.
const publicReadCors = cors({ methods: ['GET', 'OPTIONS'], optionsSuccessStatus: 200 });

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', publicReadCors, productRoutes);
app.use('/api/orders', restrictedCors, orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
