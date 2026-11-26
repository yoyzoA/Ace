const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { createRateLimiter } = require('./middleware/rateLimit');

dotenv.config();

const app = express();

// Visitors reach us through CloudFront and then the server's own proxy, so the
// visitor's real address is two hops back. Override with TRUST_PROXY if that changes.
app.set('trust proxy', Number(process.env.TRUST_PROXY || 2));
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

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

// Orders and catalog requests are small; refuse anything larger.
app.use(express.json({ limit: '20kb' }));

// A cap on order attempts per visitor address per hour, so a script can't flood
// the shop with fake orders that hold stock. Kept generous in case several
// customers ever share one address; the per-phone limit in the order handler
// is the main guard.
const orderLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.ORDER_LIMIT_PER_HOUR || 20),
  message: 'Too many orders from this device. Please call or WhatsApp us to finish your order.'
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', publicReadCors, productRoutes);
app.use('/api/orders', restrictedCors, (req, res, next) => (req.method === 'POST' ? orderLimiter(req, res, next) : next()), orderRoutes);

// Malformed or oversized JSON: answer plainly instead of with a stack trace.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
  console.error(err);
  return res.status(500).json({ error: 'Something went wrong.' });
});

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
