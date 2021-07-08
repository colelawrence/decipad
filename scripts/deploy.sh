#!/bin/bash

set -euo pipefail


echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building frontend..."
npm run build:frontend
cp -rT dist/apps/client/exported apps/backend/public

echo "Building storybook..."
npm run build:storybook
cp -rT dist/storybook/ui apps/backend/public/.storybook


echo "Deploying..."
cd apps/backend
./node_modules/.bin/arc deploy --no-hydrate
