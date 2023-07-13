#!/bin/bash

set -euo pipefail

echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Configuring the frontend..."
touch apps/frontend/.env.production
echo "GIT_COMMIT_HASH=${GIT_COMMIT_HASH:-${GITHUB_SHA:-}}" >> apps/frontend/.env.production
echo "REACT_APP_SENTRY_DSN=${SENTRY_DSN:-}" >> apps/frontend/.env.production
echo "REACT_APP_SENTRY_ORG=${SENTRY_ORG:-}" >> apps/frontend/.env.production
echo "REACT_APP_SENTRY_PROJECT=${SENTRY_PROJECT:-}" >> apps/frontend/.env.production
echo "REACT_APP_SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}" >> apps/frontend/.env.production
echo "REACT_APP_SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}" >> apps/frontend/.env.production
echo "REACT_APP_ANALYTICS_WRITE_KEY=${REACT_APP_ANALYTICS_WRITE_KEY:-}" >> apps/frontend/.env.production
echo "REACT_APP_GOOGLE_SHEETS_KEY=${REACT_APP_GOOGLE_SHEETS_KEY:-}" >> apps/frontend/.env.production
echo "STRIPE_PAYMENT_LINK"=${STRIPE_PAYMENT_LINK:-} >> apps/frontend/.env.production
echo "STRIPE_CUSTOMER_PORTAL_LINK"=${STRIPE_CUSTOMER_PORTAL_LINK:-} >> apps/frontend/.env.production

echo "Building frontend..."
yarn build:frontend
cp -rT dist/apps/frontend/. apps/backend/public

echo "Building docs..."
yarn build:docs
mkdir -p apps/backend/public/docs
cp -rT apps/docs/build/. apps/backend/public/docs

echo "Building the backend..."
yarn build:backend:ssr

echo "Clearing sourcemaps..."
(find apps/backend/public/ | grep '\.map$' | xargs -r rm) || true


echo "Deploying..."
mkdir -p tmp/deploy
cd apps/backend

../../node_modules/.bin/arc deploy --no-hydrate
