#!/bin/bash

set -euo pipefail


echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building frontend..."
npm run build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Building storybook..."
npm run build:storybook
cp -rT dist/storybook/ui/. apps/backend/public/.storybook

echo "Building the backend..."
npm run build:backend

echo "Deploying..."
mkdir -p tmp/deploy
cd apps/backend
./node_modules/.bin/arc deploy --no-hydrate | tee ../../tmp/deploy/result.txt

echo "Configuring the client..."
cd ../..
WSS=`grep -Eo "wss://[^/\"]+" ./tmp/deploy/result.txt`
echo "Found WSS address: ${WSS}"
echo "NEXT_PUBLIC_DECI_WS_URL=${WSS}/staging" > apps/client/.env.production
echo "NEXT_SENTRY_DSN=https://95cb017d05284b08b7b24b6dfe258962@o592547.ingest.sentry.io/5741035" >> apps/client/.env.production

echo "Building frontend..."
npm run build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Deploying client for \"$DEPLOY_NAME\"..."
cd apps/backend
./node_modules/.bin/arc deploy --static --prune --no-hydrate
