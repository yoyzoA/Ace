// The admin app's private settings (database link, admin login, signing key).
// They live in this Windows user's app-data folder, never inside the installer,
// so sharing or losing the installer doesn't expose them.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ADMIN_CORS_ORIGINS'];

const settingsFile = (app) => path.join(app.getPath('userData'), 'admin-settings.env');

// Minimal .env reader: KEY=value lines, optional quotes, # comments.
const parseEnv = (text) => {
  const out = {};
  String(text || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) return;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, '');
      }
      out[match[1]] = value;
    });
  return out;
};

const serialize = (values) =>
  KEYS.filter((key) => values[key])
    .map((key) => `${key}=${String(values[key]).replace(/\r?\n/g, '')}`)
    .join('\n') + '\n';

const readSettings = (app) => {
  try {
    return parseEnv(fs.readFileSync(settingsFile(app), 'utf8'));
  } catch {
    return null;
  }
};

const isComplete = (values) =>
  Boolean(values && values.MONGODB_URI && values.ADMIN_EMAIL && values.ADMIN_PASSWORD && values.JWT_SECRET);

const newSigningKey = () => crypto.randomBytes(48).toString('hex');

const validate = (values) => {
  const errors = {};
  if (!/^mongodb(\+srv)?:\/\/.+/.test(values.MONGODB_URI || '')) {
    errors.MONGODB_URI = 'Paste the full connection string, starting with mongodb+srv://';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.ADMIN_EMAIL || '')) {
    errors.ADMIN_EMAIL = 'Enter the email you will sign in with.';
  }
  if (!values.ADMIN_PASSWORD || values.ADMIN_PASSWORD.length < 8) {
    errors.ADMIN_PASSWORD = 'Use at least 8 characters (12 or more is better).';
  }
  return errors;
};

const writeSettings = (app, values) => {
  const clean = {};
  KEYS.forEach((key) => {
    if (values[key]) clean[key] = String(values[key]).trim();
  });
  // A short or missing signing key is replaced with a strong random one.
  if (!clean.JWT_SECRET || clean.JWT_SECRET.length < 32) clean.JWT_SECRET = newSigningKey();
  const file = settingsFile(app);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serialize(clean), { encoding: 'utf8', mode: 0o600 });
  return clean;
};

module.exports = { KEYS, parseEnv, readSettings, writeSettings, isComplete, validate, settingsFile, newSigningKey };
