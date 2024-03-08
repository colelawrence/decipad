#!/bin/bash

set -euo pipefail

echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Configuring the frontend..."
touch apps/frontend/.env.production
echo "GIT_COMMIT_HASH=${GIT_COMMIT_HASH:-${GITHUB_SHA:-}}" >> apps/frontend/.env.production
echo "VITE_SENTRY_DSN=${SENTRY_DSN:-}" >> apps/frontend/.env.production
echo "VITE_SENTRY_ORG=${SENTRY_ORG:-}" >> apps/frontend/.env.production
echo "VITE_SENTRY_PROJECT=${SENTRY_PROJECT:-}" >> apps/frontend/.env.production
echo "VITE_SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}" >> apps/frontend/.env.production
echo "VITE_SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}" >> apps/frontend/.env.production
echo "VITE_ANALYTICS_WRITE_KEY=${VITE_ANALYTICS_WRITE_KEY:-}" >> apps/frontend/.env.production
echo "VITE_GOOGLE_SHEETS_KEY=${VITE_GOOGLE_SHEETS_KEY:-}" >> apps/frontend/.env.production
echo "INTERCOM_SECRET_ID=${INTERCOM_SECRET_ID:-}" >> apps/frontend/.env.production
echo "VITE_STRIPE_CUSTOMER_PORTAL_LINK"=${VITE_STRIPE_CUSTOMER_PORTAL_LINK:-} >> apps/frontend/.env.production
echo "VITE_STRIPE_API_KEY"=${VITE_STRIPE_API_KEY:-} >> apps/frontend/.env.production
echo "VITE_DECI_APP_URL_BASE"=${DECI_APP_URL_BASE:-} >> apps/frontend/.env.production

echo "Building frontend..."
yarn build:frontend
cp -rT dist/apps/frontend/. apps/backend/public

# Removes the sourcemaps/built individual JS files
rm -r dist/apps/frontend/src 2> /dev/null || true

echo "Building notebook open API manifest..."
DECI_DOMAIN="$DECI_APP_URL_BASE" nx build backend-notebook

echo "Building docs..."
yarn build:docs
mkdir -p apps/backend/public/docs
cp -rT apps/docs/build/. apps/backend/public/docs

echo "Building the backend..."
yarn build:backend:ssr

echo "Building the notebook API..."
DECI_DOMAIN="$DECI_APP_URL_BASE" nx build backend-notebook

echo "Clearing sourcemaps..."
(find apps/backend/public/ | grep '\.map$' | xargs -r rm) || true

echo "Deploying \"$DEPLOY_NAME\"..."
mkdir -p tmp/deploy
cd apps/backend
arc env staging DECI_APP_URL_BASE "$DECI_APP_URL_BASE"
arc env staging NEXTAUTH_URL "${DECI_APP_URL_BASE}/api/auth"

../../node_modules/.bin/arc deploy --no-hydrate --name "$DEPLOY_NAME"
