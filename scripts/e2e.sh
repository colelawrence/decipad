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

echo "running E2E tests and snapshots..."
cd apps/e2e
npx percy exec -- npx playwright test --retries=3
