const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

const safeEqual = (a, b) => {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

// After 5 wrong attempts from one address, sign-in pauses for 15 minutes.
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map();

const lockedFor = (key) => {
  const entry = failures.get(key);
  if (!entry) return 0;
  if (Date.now() - entry.first > LOCK_MS) {
    failures.delete(key);
    return 0;
  }
  return entry.count >= MAX_FAILURES ? entry.first + LOCK_MS - Date.now() : 0;
};

const recordFailure = (key) => {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > LOCK_MS) failures.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
};

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const key = req.ip || 'unknown';

  const wait = lockedFor(key);
  if (wait > 0) {
    return res
      .status(429)
      .json({ message: `Too many wrong attempts. Try again in ${Math.ceil(wait / 60000)} minutes.` });
  }

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const validEmail = safeEqual(email, process.env.ADMIN_EMAIL || '');
  const validPassword = safeEqual(password, process.env.ADMIN_PASSWORD || '');

  if (!validEmail || !validPassword || !process.env.ADMIN_PASSWORD) {
    recordFailure(key);
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  failures.delete(key);

  const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });

  return res.json({ token });
});

module.exports = router;
