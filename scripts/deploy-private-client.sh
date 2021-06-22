#!/bin/bash

set -euo pipefail

set -o allexport;
source ./.private-deploy.env;
set +o allexport;

echo "Deploying client on \"$DEPLOY_NAME\"...";


nx export client
cd apps/backend

./node_modules/.bin/arc deploy --static --prune  --name "$DEPLOY_NAME"

echo "Go to $DECI_APP_URL_BASE"
