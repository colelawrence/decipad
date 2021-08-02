#!/bin/bash

set -euo pipefail

set -o allexport;
source ./.private-deploy.env;
set +o allexport;


echo "Preparing the public files folder...";
rm -rf apps/backend/public
mkdir apps/backend/public

echo "Building frontend..."
npm run build:frontend
cp -r dist/apps/client/exported/. apps/backend/public

echo "Building storybook..."
npm run build:storybook
cp -r dist/storybook/ui/. apps/backend/public/.storybook

echo "Building backend..."
npm run build:backend

## Trying prevent #295 (https://github.com/decipad/decipad/pull/295)
mkdir -p apps/backend/src/shared;

echo "Deploying \"$DEPLOY_NAME\"...";
cd apps/backend

./node_modules/.bin/arc env staging DECI_APP_URL_BASE "$DECI_APP_URL_BASE"
./node_modules/.bin/arc env staging DECI_INVITE_EXPIRATION_SECONDS "$DECI_INVITE_EXPIRATION_SECONDS"
./node_modules/.bin/arc env staging DECI_KEY_VALIDATION_EXPIRATION_SECONDS "$DECI_KEY_VALIDATION_EXPIRATION_SECONDS"
./node_modules/.bin/arc env staging DECI_FROM_EMAIL_ADDRESS "$DECI_FROM_EMAIL_ADDRESS"
./node_modules/.bin/arc env staging JWT_SIGNING_PRIVATE_KEY "$JWT_SIGNING_PRIVATE_KEY"
./node_modules/.bin/arc env staging NEXTAUTH_URL "${DECI_APP_URL_BASE}/api/auth"
./node_modules/.bin/arc env staging GITHUB_CLIENT_ID "$GITHUB_CLIENT_ID"
./node_modules/.bin/arc env staging GITHUB_CLIENT_SECRET "$GITHUB_CLIENT_SECRET"
./node_modules/.bin/arc env staging JWT_SECRET "$JWT_SECRET"
./node_modules/.bin/arc env staging DECI_SES_ACCESS_KEY_ID "$DECI_SES_ACCESS_KEY_ID"
./node_modules/.bin/arc env staging DECI_SES_SECRET_ACCESS_KEY "$DECI_SES_SECRET_ACCESS_KEY"
./node_modules/.bin/arc env staging DECI_S3_ENDPOINT s3.eu-west-2.amazonaws.com
./node_modules/.bin/arc env staging DECI_S3_ACCESS_KEY_ID "$DECI_S3_ACCESS_KEY_ID"
./node_modules/.bin/arc env staging DECI_S3_SECRET_ACCESS_KEY "$DECI_S3_SECRET_ACCESS_KEY"
./node_modules/.bin/arc env staging DECI_S3_PADS_BUCKET "$DECI_S3_PADS_BUCKET"

./node_modules/.bin/arc env staging NODE_OPTIONS --enable-source-maps

./node_modules/.bin/arc deploy --prune --no-hydrate --name "$DEPLOY_NAME"
