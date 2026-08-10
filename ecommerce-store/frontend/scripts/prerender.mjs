// Prerenders the built SPA into static HTML snapshots so crawlers that don't
// execute JavaScript (most AI/LLM crawlers, some search bots) can read real
// page content instead of an empty <div id="root">.
//
// By default this crawls a local `vite preview` server, which is fine for
// pages with no data fetching but will hit CORS for pages that call the API
// (the API only trusts the production origin). Set PRERENDER_BASE_URL to the
// live site (e.g. https://acecomputerslb.com) to prerender with real data.
//
// This never fails `npm run build`/`npm run prerender`: any error here is
// caught and logged as a warning, and the existing dist/ output is left as-is.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PORT = 4173;
const DIST_DIR = path.resolve('dist');
// Static/informational pages plus the catalog listing page only. Individual
// product pages (there are 1000+) are left to real search-engine crawlers,
// which do render JS; a full sitemap.xml lists every product URL for them.
// See generate-sitemap.mjs.
const MAX_PAGES = 40;
const SKIP_PREFIXES = ['/cart', '/checkout', '/products/'];
const STATUS_WAIT_MS = 3000;
const STATUS_POLL_MS = 250;

function isSkipped(pathname) {
  return SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

function outputPathFor(pathname) {
  if (pathname === '/') {
    return path.join(DIST_DIR, 'index.html');
  }
  return path.join(DIST_DIR, pathname.replace(/^\//, ''), 'index.html');
}

async function waitForPageStatus(page) {
  const start = Date.now();
  let status = await page.evaluate(() => document.body.dataset.pageStatus);

  while (status === 'loading' && Date.now() - start < STATUS_WAIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, STATUS_POLL_MS));
    status = await page.evaluate(() => document.body.dataset.pageStatus);
  }

  return status;
}

async function crawlAndSnapshot(puppeteer, baseUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const visited = new Set();
  const queue = ['/'];
  let savedCount = 0;
  let skippedCount = 0;

  try {
    const page = await browser.newPage();

    while (queue.length && visited.size < MAX_PAGES) {
      const pathname = normalizePathname(queue.shift());
      if (visited.has(pathname) || isSkipped(pathname)) continue;
      visited.add(pathname);

      await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'networkidle0', timeout: 30000 });

      const status = await waitForPageStatus(page);

      if (status === 'error' || status === 'loading') {
        console.warn(`[prerender] Skipping ${pathname} (page data status: ${status})`);
        skippedCount += 1;
      } else {
        const html = await page.evaluate(() => document.documentElement.outerHTML);
        const outputPath = outputPathFor(pathname);
        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(outputPath, `<!doctype html>\n${html}`);
        savedCount += 1;
      }

      const links = await page.$$eval('a[href]', (anchors) =>
        anchors.map((a) => a.getAttribute('href'))
      );

      for (const href of links) {
        if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
        const linkPathname = normalizePathname(href.split('#')[0].split('?')[0]);
        if (!visited.has(linkPathname) && !isSkipped(linkPathname)) {
          queue.push(linkPathname);
        }
      }
    }
  } finally {
    await browser.close();
  }

  return { savedCount, skippedCount };
}

async function resolveBaseUrl() {
  if (process.env.PRERENDER_BASE_URL) {
    return { baseUrl: process.env.PRERENDER_BASE_URL.replace(/\/$/, ''), close: async () => {} };
  }

  const { preview } = await import('vite');
  const server = await preview({ preview: { port: PORT, strictPort: true } });
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '');

  return {
    baseUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.httpServer.close((error) => (error ? reject(error) : resolve()));
      })
  };
}

async function main() {
  const { default: puppeteer } = await import('puppeteer');
  const { baseUrl, close } = await resolveBaseUrl();

  console.log(`[prerender] Crawling ${baseUrl} ...`);

  try {
    const { savedCount, skippedCount } = await crawlAndSnapshot(puppeteer, baseUrl);
    console.log(
      `[prerender] Saved ${savedCount} static HTML snapshot(s) into dist/` +
        (skippedCount ? `, skipped ${skippedCount} page(s) that hadn't loaded data.` : '.')
    );
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.warn(
    '[prerender] Skipped: prerendering failed, continuing with the client-rendered build only.'
  );
  console.warn(error?.message || error);
});
