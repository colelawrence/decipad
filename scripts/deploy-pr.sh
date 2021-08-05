#!/bin/bash

set -euo pipefail

echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building storybook..."
npm run build:storybook
cp -rT dist/storybook/ui/. apps/backend/public/.storybook

echo "Building the backend..."
npm run build:backend

echo "Deploying \"$DEPLOY_NAME\"..."
mkdir -p tmp/deploy
cd apps/backend
./node_modules/.bin/arc deploy --prune --no-hydrate --name "$DEPLOY_NAME" | tee ../../tmp/deploy/result.txt
cd ../..
WSS=`grep -Eo "wss://[^/\"]+" ./tmp/deploy/result.txt`
echo "Found WSS address: ${WSS}"
echo "NEXT_PUBLIC_DECI_WS_URL=${WSS}/staging" > apps/client/.env.production

echo "Building frontend..."
npm run build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Deploying client for \"$DEPLOY_NAME\"..."
cd apps/backend
./node_modules/.bin/arc deploy --static --prune --no-hydrate --name "$DEPLOY_NAME"
