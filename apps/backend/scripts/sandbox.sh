#!/bin/bash

set -euo pipefail

cd ../..

SERVICE_PIDS=""

teardown () {
  if [ -n "$SERVICE_PIDS" ]; then
    echo "Killing these PIDEs:" $SERVICE_PIDS
    kill -s SIGINT -- $SERVICE_PIDS
    true
  fi
}

trap "teardown" EXIT

if [[ -z "${CI:-}" ]]; then
  yarn build:backend:watch&
  SERVICE_PIDS="${SERVICE_PIDS} ${!}"
else
  yarn build:backend
fi

cd apps/backend
NEXTAUTH_URL=http://localhost:3000 ../../node_modules/.bin/sandbox
