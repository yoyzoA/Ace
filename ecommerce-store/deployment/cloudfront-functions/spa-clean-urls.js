// CloudFront Function (viewer-request) for the acecomputerslb.com distribution.
//
// The frontend is a static SPA build where some routes are also prerendered
// into real files (e.g. dist/about/index.html, dist/products/index.html).
// S3 only serves an object at the exact key requested, so a request for
// "/about" (no trailing slash, the URL every internal link and the sitemap
// use) does not resolve to "about/index.html" on its own - it 404s and falls
// back to the plain SPA shell at the root index.html via CustomErrorResponses.
//
// This function rewrites extensionless request URIs to point at the nested
// index.html, so prerendered routes are actually served to crawlers hitting
// the canonical (no-trailing-slash) URL. Requests for real files (anything
// with a "." in the last path segment, e.g. .js, .css, .png, .xml, .txt) are
// left untouched.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var lastSegment = uri.split('/').pop();
  if (lastSegment.indexOf('.') !== -1) {
    return request;
  }

  request.uri = uri.endsWith('/') ? uri + 'index.html' : uri + '/index.html';

  return request;
}
