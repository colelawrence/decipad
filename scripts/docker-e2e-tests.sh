#!/bin/bash

set -euo pipefail

# Run e2e tests locally
# Usage:
# $ scripts/docker-e2e-tests.sh
#
# Usage with args (passed on to `npx playwright`):
# $ scripts/docker-e2e-tests.sh -g my-test-file

function wait_for_dev_server {
  if curl -s http://localhost:3000 2>&1 >/dev/null; then
    echo "✔️ Dev server is up, let's go!"
    return
  fi

  echo "⏳ Waiting for the dev server..."
  sleep 2
  wait_for_dev_server
}

wait_for_dev_server

# Echo every command
set -x

# https://playwright.dev/docs/docker
PLAYWRIGHT_DOCKER_IMAGE=mcr.microsoft.com/playwright:v1.32.0-focal

# Use playwright's docker container
docker run --rm -it \
  --cpuset-cpus="0" \
  -v "$(pwd):/code" \
  --workdir /code/apps/e2e \
  -u "$(id -u)" \
  --network host \
  --ipc=host "${PLAYWRIGHT_DOCKER_IMAGE}" \
  npx playwright test $@

