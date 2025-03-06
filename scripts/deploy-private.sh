#!/usr/bin/env bash

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
yarn build:backend:ssr

echo "Clearing sourcemaps..."
(find apps/backend/public/ | grep '\.map$' | xargs -r rm) || true

## Trying prevent #295 (https://github.com/decipad/decipad/pull/295)
mkdir -p apps/backend/src/shared;

echo "Deploying \"$DEPLOY_NAME\"...";
cd apps/backend

cd public

set +euo pipefail
SEARCH_RESULT=`grep -rl "AWS_SECRET"`
set -euo pipefail

if [ -n "${SEARCH_RESULT:-}" ]; then
  echo "Found AWS_SECRET in production build"
  exit 1
fi

cd ..

export PATH=./node_modules/.bin:$PATH;
arc env staging DECI_APP_URL_BASE "$DECI_APP_URL_BASE"
arc env staging DECI_INVITE_EXPIRATION_SECONDS "$DECI_INVITE_EXPIRATION_SECONDS"
arc env staging DECI_KEY_VALIDATION_EXPIRATION_SECONDS "$DECI_KEY_VALIDATION_EXPIRATION_SECONDS"
arc env staging DECI_FROM_EMAIL_ADDRESS "$DECI_FROM_EMAIL_ADDRESS"
arc env staging NEXTAUTH_URL "${DECI_APP_URL_BASE}/api/auth"
arc env staging JWT_SECRET "$JWT_SECRET"
arc env staging OPENAI_API_KEY "$OPENAI_API_KEY"
arc env staging GIPHY_API_KEY "$GIPHY_API_KEY"
arc env staging UNSPLASH_API_KEY "$UNSPLASH_API_KEY"
arc env staging REPLICATE_API_KEY "$REPLICATE_API_KEY"
arc env staging MAILERSEND_API_KEY "$MAILERSEND_API_KEY"
arc env staging DECI_SES_SECRET_ACCESS_KEY "$DECI_SES_SECRET_ACCESS_KEY"
arc env staging DECI_S3_ENDPOINT s3.eu-west-2.amazonaws.com
arc env staging DECI_S3_ACCESS_KEY_ID "$DECI_S3_ACCESS_KEY_ID"
arc env staging DECI_S3_SECRET_ACCESS_KEY "$DECI_S3_SECRET_ACCESS_KEY"
arc env staging DECI_S3_PADS_BUCKET "$DECI_S3_PADS_BUCKET"
arc env staging DECI_S3_PAD_BACKUPS_BUCKET "$DECI_S3_PAD_BACKUPS_BUCKET"
arc env staging DECI_MAX_CREDITS_FREE "${DECI_MAX_CREDITS_FREE}"
arc env staging DECI_MAX_CREDITS_PRO "${DECI_MAX_CREDITS_PRO}"
arc env staging DECI_MAX_QUERIES_FREE "${DECI_MAX_QUERIES_FREE}"
arc env staging DECI_MAX_QUERIES_PRO "${DECI_MAX_QUERIES_PRO}"
arc env staging NODE_OPTIONS "--enable-source-maps --max_old_space_size=32768"
arc env staging GIT_COMMIT_HASH "${GIT_COMMIT_HASH:=$(git rev-parse HEAD)}"
arc env staging INTERCOM_SECRET_ID "${INTERCOM_SECRET_ID}"
arc env staging STRIPE_API_KEY "${STRIPE_API_KEY}"
arc env staging STRIPE_SECRET_KEY "${STRIPE_SECRET_KEY}"
arc env staging STRIPE_EXTRA_CREDITS_PRODUCT_ID "${STRIPE_EXTRA_CREDITS_PRODUCT_ID}"
arc env staging STRIPE_SUBSCRIPTIONS_PRODUCT_ID "${STRIPE_SUBSCRIPTIONS_PRODUCT_ID}"
arc env staging STRIPE_WEBHOOK_SECRET "${STRIPE_WEBHOOK_SECRET}"
arc env staging WORKSPACE_FREE_PLAN "${WORKSPACE_FREE_PLAN}"
arc env staging WORKSPACE_PRO_PLAN "${WORKSPACE_PRO_PLAN}"

arc deploy --prune --no-hydrate --name "$DEPLOY_NAME"
