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
cp -r dist/apps/client/exported/. apps/backend/public

echo "Building storybook..."
yarn build:storybook
cp -r dist/storybook/ui/. apps/backend/public/.storybook


echo "Deploying client on \"$DEPLOY_NAME\"...";
cd apps/backend

./node_modules/.bin/arc deploy --static --prune --name "$DEPLOY_NAME"

echo "Go to $DECI_APP_URL_BASE"
