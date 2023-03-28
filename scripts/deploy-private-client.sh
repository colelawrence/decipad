#!/bin/bash

set -euo pipefail

set -o allexport;
source ./.private-deploy.env;
set +o allexport;


echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building frontend..."
yarn build:frontend
cp -rT dist/apps/frontend/. apps/backend/public

echo "Building storybook..."
yarn build:storybook
cp -rT dist/storybook/ui/. apps/backend/public/.storybook

echo "Clearing sourcemaps..."
(find apps/backend/public/ | grep '\.map$' | xargs -r rm) || true

echo "Deploying client on \"$DEPLOY_NAME\"...";
cd apps/backend

../../node_modules/.bin/arc deploy --static --prune --name "$DEPLOY_NAME"

echo "Go to $DECI_APP_URL_BASE"
