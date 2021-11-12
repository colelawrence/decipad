#!/bin/bash

set -euo pipefail


echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building frontend..."
yarn build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Building storybook..."
yarn build:storybook
cp -rT dist/storybook/ui/. apps/backend/public/.storybook

echo "Building docs..."
yarn build:docs
mkdir -p apps/backend/public/docs
cp -rT apps/docs/build/. apps/backend/public/docs

echo "Building the backend..."
yarn build:backend

echo "Deploying..."
mkdir -p tmp/deploy
cd apps/backend
../../node_modules/.bin/arc deploy --no-hydrate | tee ../../tmp/deploy/result.txt

echo "Configuring the client..."
cd ../..
WSS=`grep -Eo "wss://[^/\"]+" ./tmp/deploy/result.txt`
echo "Found WSS address: ${WSS}"
echo "NEXT_PUBLIC_DECI_WS_URL=${WSS}/staging" > apps/client/.env.production
echo "NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN:-}" >> apps/client/.env.production
echo "NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT:-}" >> apps/client/.env.production

echo "Building frontend..."
yarn build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Deploying client..."
cd apps/backend
../../node_modules/.bin/arc deploy --static --no-hydrate
