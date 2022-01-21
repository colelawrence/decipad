#!/bin/bash

set -euo pipefail

echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Configuring the client..."
touch apps/client/.env.production
echo "SENTRY_DSN=${SENTRY_DSN:-}" >> apps/client/.env.production
echo "SENTRY_ORG=${SENTRY_ORG:-}" >> apps/client/.env.production
echo "SENTRY_PROJECT=${SENTRY_PROJECT:-}" >> apps/client/.env.production
echo "SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}" >> apps/client/.env.production
echo "SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}" >> apps/client/.env.production
echo "NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN:-}" >> apps/client/.env.production
echo "NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT:-}" >> apps/client/.env.production
echo "NEXT_PUBLIC_ANALYTICS_WRITE_KEY=${NEXT_PUBLIC_ANALYTICS_WRITE_KEY:-}" >> apps/client/.env.production

echo "Building frontend..."
yarn build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Building storybook..."
yarn build:storybook
cp -rT dist/storybook/ui/. apps/backend/public/.storybook

echo "Building docs..."
yarn build:docs
mkdir -p apps/backend/public/docs
cp -r apps/docs/build/. apps/backend/public/docs

echo "Building the backend..."
yarn build:backend

echo "Deploying \"$DEPLOY_NAME\"..."
mkdir -p tmp/deploy
cd apps/backend
../../node_modules/.bin/arc deploy --no-hydrate --name "$DEPLOY_NAME"
