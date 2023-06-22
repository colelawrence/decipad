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

echo "Building docs..."
yarn build:docs
mkdir -p apps/backend/public/docs
cp -rT apps/docs/build/. apps/backend/public/docs

echo "Building backend..."
yarn build:backend

echo "Clearing sourcemaps..."
(find apps/backend/public/ | grep '\.map$' | xargs -r rm) || true

## Trying prevent #295 (https://github.com/decipad/decipad/pull/295)
mkdir -p apps/backend/src/shared;

echo "Deploying \"$DEPLOY_NAME\"...";
cd apps/backend

export PATH=./node_modules/.bin:$PATH;
arc env staging DECI_APP_URL_BASE "$DECI_APP_URL_BASE"
arc env staging DECI_INVITE_EXPIRATION_SECONDS "$DECI_INVITE_EXPIRATION_SECONDS"
arc env staging DECI_KEY_VALIDATION_EXPIRATION_SECONDS "$DECI_KEY_VALIDATION_EXPIRATION_SECONDS"
arc env staging DECI_FROM_EMAIL_ADDRESS "$DECI_FROM_EMAIL_ADDRESS"
arc env staging NEXTAUTH_URL "${DECI_APP_URL_BASE}/api/auth"
arc env staging GITHUB_CLIENT_ID "$GITHUB_CLIENT_ID"
arc env staging GITHUB_CLIENT_SECRET "$GITHUB_CLIENT_SECRET"
arc env staging JWT_SECRET "$JWT_SECRET"
arc env staging OPENAI_API_KEY "$OPENAI_API_KEY"
arc env staging DECI_SES_ACCESS_KEY_ID "$DECI_SES_ACCESS_KEY_ID"
arc env staging DECI_SES_SECRET_ACCESS_KEY "$DECI_SES_SECRET_ACCESS_KEY"
arc env staging DECI_S3_ENDPOINT s3.eu-west-2.amazonaws.com
arc env staging DECI_S3_ACCESS_KEY_ID "$DECI_S3_ACCESS_KEY_ID"
arc env staging DECI_S3_SECRET_ACCESS_KEY "$DECI_S3_SECRET_ACCESS_KEY"
arc env staging DECI_S3_PADS_BUCKET "$DECI_S3_PADS_BUCKET"
arc env staging NODE_OPTIONS "--enable-source-maps --max_old_space_size=16384"
arc env staging GIT_COMMIT_HASH "${GIT_COMMIT_HASH:=$(git rev-parse HEAD)}"
arc env staging INTERCOM_SECRET_ID "${INTERCOM_SECRET_ID}"
arc env staging STRIPE_API_KEY "${STRIPE_API_KEY}"
arc env staging STRIPE_SECRET_KEY "${STRIPE_SECRET_KEY}"
arc env staging STRIPE_WEBHOOK_SECRET "${STRIPE_WEBHOOK_SECRET}"
arc env staging STRIPE_PAYMENT_LINK "${STRIPE_PAYMENT_LINK}"
arc env staging STRIPE_CUSTOMER_PORTAL_LINK "${STRIPE_CUSTOMER_PORTAL_LINK}"

arc deploy --prune --no-hydrate --name "$DEPLOY_NAME"
