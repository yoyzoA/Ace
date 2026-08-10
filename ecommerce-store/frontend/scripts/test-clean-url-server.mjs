// Dev helper: serves dist/ while mimicking the CloudFront Function in
// deployment/cloudfront-functions/spa-clean-urls.js (rewrites extensionless
// request URIs to the nested index.html). Run `npm run build && npm run
// prerender && npm run preview:prerendered` to check prerendered pages at
// their real (non-trailing-slash) URLs, e.g. http://localhost:4176/about.
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');
const PORT = 4176;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
};

createServer((req, res) => {
  let uri = decodeURIComponent(req.url.split('?')[0]);
  const lastSegment = uri.split('/').pop();

  if (!lastSegment.includes('.')) {
    uri = uri.endsWith('/') ? `${uri}index.html` : `${uri}/index.html`;
  }

  const filePath = join(DIST_DIR, uri);

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`Clean-URL test server on http://localhost:${PORT}`);
});
