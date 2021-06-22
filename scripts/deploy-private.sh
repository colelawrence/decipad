#!/bin/bash

set -euo pipefail

set -o allexport;
source ./.private-deploy.env;
set +o allexport;

echo "Deploying \"$DEPLOY_NAME\"...";


nx export client
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
./node_modules/.bin/arc env staging NODE_OPTIONS --enable-source-maps

./node_modules/.bin/arc deploy --prune --no-hydrate --name "$DEPLOY_NAME"
