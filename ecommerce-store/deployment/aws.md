# AWS Deployment Prep (electronics-store)

Region: eu-central-1

This project is prepared for deployment but not deployed. Use the following command templates with your own values.

## Backend (Elastic Beanstalk)

Package the backend from `ecommerce-store/backend` (zip the folder contents, not the parent folder).

Example CLI flow:

```
cd ecommerce-store/backend
zip -r ../backend.zip .

aws elasticbeanstalk create-application \
  --application-name electronics-store \
  --region eu-central-1

aws s3 mb s3://electronics-store-eb-artifacts --region eu-central-1
aws s3 cp ../backend.zip s3://electronics-store-eb-artifacts/backend.zip

aws elasticbeanstalk create-application-version \
  --application-name electronics-store \
  --version-label v1 \
  --source-bundle S3Bucket=electronics-store-eb-artifacts,S3Key=backend.zip \
  --region eu-central-1

aws elasticbeanstalk create-environment \
  --application-name electronics-store \
  --environment-name electronics-store-api \
  --solution-stack-name "64bit Amazon Linux 2 v5.8.7 running Node.js 18" \
  --version-label v1 \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=MONGODB_URI,Value=<your-atlas-connection-string> \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=CORS_ORIGIN,Value=<your-frontend-domain> \
    Namespace=aws:elasticbeanstalk:environment:process:default,OptionName=HealthCheckPath,Value=/api/health \
  --region eu-central-1
```

Notes:
- Health check is also configured via `backend/.ebextensions/healthcheck.config`.
- Update the Node.js solution stack version to the latest available in your account.

## Frontend (S3 + CloudFront)

Build the frontend:

```
cd ecommerce-store/frontend
npm install
npm run build
```

Create the S3 bucket and enable static website hosting (public bucket flow):

```
aws s3 mb s3://electronics-store-frontend --region eu-central-1
aws s3 website s3://electronics-store-frontend --index-document index.html --error-document index.html
aws s3 sync dist s3://electronics-store-frontend --delete
```

Create a CloudFront distribution (replace bucket and comment values):

```
aws cloudfront create-distribution \
  --distribution-config file://deployment/cloudfront-distribution.json
```

After creation, update your frontend base URL:

- Set `VITE_API_BASE_URL` to the HTTPS CloudFront API endpoint (for example: `https://d3gq8urup3ba6k.cloudfront.net`).
- Rebuild and re-sync the `dist/` folder to S3.

Replace placeholders in `deployment/cloudfront-distribution.json`:
- `CallerReference`: set a unique value.
- `DomainName`: set to your S3 bucket domain (for example: `electronics-store-frontend.s3.eu-central-1.amazonaws.com`).

## SPA routing (React)

Ensure CloudFront returns `index.html` for 403/404 by using the `CustomErrorResponses` settings in the distribution config.

## Prerendering and the clean-URL CloudFront Function (one-time setup)

The frontend build now also produces static HTML snapshots for crawler/AI visibility
(see `frontend/scripts/prerender.mjs` and `frontend/scripts/generate-sitemap.mjs`).
The deploy workflow (`.github/workflows/deploy.yml`) already: builds, syncs to S3,
invalidates, prerenders against the live site, syncs the snapshots, and invalidates
again. No further CI changes are needed.

However, S3 only serves an object at the exact key requested. A snapshot written to
`about/index.html` is only reachable at the URL `/about/` (trailing slash) unless
CloudFront rewrites the request first - and every internal link, the sitemap, and
canonical tags on this site use `/about` (no trailing slash). Without the rewrite,
those requests 404 and CloudFront's `CustomErrorResponses` silently fall back to the
plain SPA shell at the root `index.html`, so the prerendered content is never served.

This is a one-time setup step (not part of CI) to fix that, using the function in
`deployment/cloudfront-functions/spa-clean-urls.js`:

```
aws cloudfront create-function \
  --name spa-clean-urls \
  --function-config Comment="Rewrite extensionless URIs to /index.html for prerendered SPA routes",Runtime=cloudfront-js-1.0 \
  --function-code fileb://deployment/cloudfront-functions/spa-clean-urls.js
```

Note the `ETag` returned, then publish it:

```
aws cloudfront publish-function --name spa-clean-urls --if-match <ETag from create output>
```

Then associate it with the distribution's default cache behavior as a
`viewer-request` function. Get the current config, edit
`DefaultCacheBehavior.FunctionAssociations` to add it, and update:

```
aws cloudfront get-distribution-config --id E3A66148P05R1M > current-config.json
# edit current-config.json: add to DefaultCacheBehavior
#   "FunctionAssociations": {
#     "Quantity": 1,
#     "Items": [
#       { "EventType": "viewer-request", "FunctionARN": "<published function ARN>" }
#     ]
#   }
# remove the top-level "ETag" field before using it as --distribution-config

aws cloudfront update-distribution \
  --id E3A66148P05R1M \
  --distribution-config file://current-config.json \
  --if-match <ETag from get-distribution-config>
```

Until this is done, prerendered snapshots sit unused in S3 and every route except
the homepage keeps serving the plain client-rendered shell to non-JS crawlers -
functionally identical to before prerendering was added.
