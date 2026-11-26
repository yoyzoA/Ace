const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const router = express.Router();

/*
  Product photo uploads. Each photo is cleaned up the same way as the rest of
  the catalog (edges trimmed, centred on white, 800×800 WebP) and stored in the
  website's S3 bucket under uploads/products/. The returned link is what the
  product's images list stores.

  Settings (from the admin app's connection settings or .env):
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY  an upload-only key (see README)
    S3_BUCKET          default acecomputerslb.com
    S3_REGION          default eu-central-1 (the SDK follows the bucket's real region)
    PUBLIC_ASSET_BASE  default https://acecomputerslb.com
*/

const MAX_FILES = 10;
const MAX_BYTES = 15 * 1024 * 1024;
const PREFIX = 'uploads/products';
const SIZE = 800;
const PADDING = 48;

const config = () => ({
  bucket: process.env.S3_BUCKET || 'acecomputerslb.com',
  region: process.env.S3_REGION || 'eu-central-1',
  base: String(process.env.PUBLIC_ASSET_BASE || 'https://acecomputerslb.com').replace(/\/+$/, ''),
  configured: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
});

let client = null;
const s3 = () => {
  if (!client) {
    const { region } = config();
    client = new S3Client({
      region,
      followRegionRedirects: true,
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      // The bucket name has dots, which don't work with S3's per-bucket https addresses.
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }
  return client;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: MAX_FILES, fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif|avif|heic|heif|tiff|bmp)$/.test(file.mimetype)) return cb(null, true);
    const error = new Error(`“${file.originalname}” isn't a photo. Use JPG, PNG or WebP.`);
    error.status = 400;
    return cb(error);
  }
});

// Trim plain borders, centre on white, 800×800 with breathing room, WebP.
const processPhoto = async (buffer) => {
  const base = sharp(buffer, { failOn: 'error', limitInputPixels: 80e6 }).rotate().flatten({ background: '#ffffff' });
  let trimmed;
  try {
    trimmed = await base.clone().trim({ background: '#ffffff', threshold: 18 }).toBuffer();
  } catch {
    trimmed = await base.clone().toBuffer(); // nothing to trim
  }
  const inner = SIZE - PADDING * 2;
  return sharp(trimmed)
    .resize(inner, inner, { fit: 'contain', background: '#ffffff', withoutEnlargement: false })
    .extend({ top: PADDING, bottom: PADDING, left: PADDING, right: PADDING, background: '#ffffff' })
    .webp({ quality: 82 })
    .toBuffer();
};

router.get('/status', (req, res) => {
  const { configured, bucket } = config();
  res.json({ configured, bucket });
});

router.post('/images', (req, res, next) => {
  upload.array('photos', MAX_FILES)(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Each photo must be under 15 MB.' });
    if (error.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ message: `Upload up to ${MAX_FILES} photos at a time.` });
    return res.status(error.status || 400).json({ message: error.message || 'Upload failed.' });
  });
}, async (req, res) => {
  const { configured, bucket, base } = config();
  if (!configured) {
    return res.status(503).json({
      message: 'Photo uploads aren’t set up yet. Add the upload key in Connection settings.'
    });
  }
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ message: 'Choose at least one photo.' });
  }

  const month = new Date().toISOString().slice(0, 7);
  const results = [];
  for (const file of files) {
    let body;
    try {
      body = await processPhoto(file.buffer);
    } catch {
      return res.status(400).json({ message: `Couldn't read “${file.originalname}” as a photo.` });
    }
    const key = `${PREFIX}/${month}/${crypto.randomBytes(12).toString('hex')}.webp`;
    try {
      await s3().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable'
        })
      );
    } catch (error) {
      const denied = error?.name === 'AccessDenied' || error?.$metadata?.httpStatusCode === 403;
      const badKey = ['InvalidAccessKeyId', 'SignatureDoesNotMatch'].includes(error?.name);
      return res.status(502).json({
        message: badKey
          ? 'AWS rejected the upload key. Check it in Connection settings.'
          : denied
            ? 'AWS refused the upload. The upload key needs permission to add files to uploads/ in the bucket.'
            : 'Couldn’t reach AWS to store the photo. Check your connection and try again.',
        ...(results.length ? { uploaded: results } : {})
      });
    }
    results.push({ url: `${base}/${key}`, name: file.originalname, bytes: body.length });
  }

  return res.status(201).json({ uploaded: results });
});

module.exports = router;
