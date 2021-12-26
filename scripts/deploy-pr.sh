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
cp -r apps/docs/build/. apps/backend/public/docs

echo "Building the backend..."
yarn build:backend

echo "Deploying \"$DEPLOY_NAME\"..."
mkdir -p tmp/deploy
cd apps/backend
../../node_modules/.bin/arc deploy --no-hydrate --name "$DEPLOY_NAME"
