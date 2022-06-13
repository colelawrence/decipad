#!/bin/bash

set -euo pipefail

SERVICE_PIDS=""

# Kill the services at the end, placed in a trap EXIT by services_setup
services_teardown () {
  if [ -n "$SERVICE_PIDS" ]; then
    # Intentionally not wrapping $SERVICE_PIDS in quotes here because
    # it's an (air quotes) array. Bash will split in spaces into multiple args.
    echo "Killing these PIDEs:" $SERVICE_PIDS
    kill -s SIGINT -- $SERVICE_PIDS
    true
  fi
}

services_check () {
  curl --silent "$1" 2>&1 >/dev/null
}

services_wait () {
  printf "waiting for $1 | "
  for retry in {1..120}; do
    if services_check "$1"; then
      printf "ready!\n"
      return
    else
      printf '.'
      sleep 1
    fi
  done

  printf "FAILED!\n"
  return 1
}

# Spin up the frontend and backend, but only if they're not running
services_setup () {
  trap "services_teardown" EXIT

  if services_check localhost:3000; then
    echo " ✅ ~ frontend is already up ~ "
  else
    echo " ⌛ ~ frontend is down, let me start it ~ "
    nx serve frontend &
    SERVICE_PIDS="${SERVICE_PIDS} ${!}"
  fi

  if services_check localhost:3333; then
    echo " ✅ ~ backend is already up ~ "
  else
    echo " ⌛ ~ backend is down, let me start it ~ "
    nx serve backend &
    SERVICE_PIDS="${SERVICE_PIDS} ${!}"
  fi

  services_wait localhost:3333
  services_wait localhost:3000
}
