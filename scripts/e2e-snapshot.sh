#!/usr/bin/env bash

set -euo pipefail

yarn clean

export DECI_E2E=1
export VITE_E2E=1
export PERCY_PARALLEL_TOTAL=1


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

echo "running E2E snapshots..."
echo "WARNING: Percy snapshot tests are disabled. Running regular e2e tests instead."
cd apps/e2e
# DISABLED: Percy snapshot tests are disabled
# if [ -n "${CI:-}" ]; then
#   npx percy exec --parallel -- playwright test --project=chromium --grep @snapshot
# else
#   npx playwright test $@
# fi

# Run regular e2e tests instead of Percy snapshots
npx playwright test $@

services_teardown
