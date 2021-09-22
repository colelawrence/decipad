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

echo "Building the backend..."
yarn build:backend

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
yarn build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Deploying client..."
cd apps/backend
./node_modules/.bin/arc deploy --static --prune --no-hydrate
