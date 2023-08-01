#!/bin/bash

set -euo pipefail

cd ../..

SERVICE_PIDS=""

if [[ -z "${DECI_E2E:-}" ]]; then
  # We're not in E2E mode
  # Each sandbox start generates a different JWT secret
  # so that previous JWTs are no longer valid
  export JWT_SECRET=$RANDOM
fi

teardown () {
  echo "tearing down services..."
  if [ -n "$SERVICE_PIDS" ]; then
    echo "Killing these PIDEs:" $SERVICE_PIDS
    kill -s SIGINT -- $SERVICE_PIDS
    true
  fi
}

trap "teardown" EXIT

if [[ -z "${DECI_E2E:-}" ]]; then
  yarn build:backend:watch&
  SERVICE_PIDS="${SERVICE_PIDS} ${!}"
  if [ -n "${DECI_SSR:-}" ]; then
    nx serve server-side-rendering&
    SERVICE_PIDS="${SERVICE_PIDS} ${!}"
  fi
fi

cd apps/backend

## Quiet if running for e2e tests
export ARC_QUIET="${DECI_E2E:-}"

NEXTAUTH_URL=http://localhost:3000 ../../node_modules/.bin/sandbox
