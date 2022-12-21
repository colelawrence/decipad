#!/bin/bash

set -euo pipefail

export DECI_E2E=1

# Load our local nx binary into the PATH, and the lib to start up the services
export PATH="${PATH}:${PWD}/node_modules/.bin"
. scripts/lib/services.sh


if services_check "localhost:3333"; then
  echo "Detected a server already running on port 3333. Exiting."
  exit 1
fi

if services_check "localhost:3000"; then
  echo "Detected a server already running on port 3000. Exiting."
  exit 1
fi

services_setup

# Take a TEST_SHARD env variable from CI, and if it exists it becomes an argument to playwright
# https://playwright.dev/docs/test-parallel#shard-tests-between-multiple-machines
SHARD_ARG=
if [ -n "${TEST_SHARD:-}" ]; then
  SHARD_ARG="--shard=${TEST_SHARD}"
fi

echo "running E2E tests and snapshots..."
cd apps/e2e
if [ -n "${CI:-}" ]; then
  npx percy exec -- npx playwright test --retries=3 $SHARD_ARG
else
  npx playwright test --retries=3 $SHARD_ARG
fi

services_teardown
