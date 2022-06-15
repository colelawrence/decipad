#!/bin/bash

set -euo pipefail

export DECI_E2E=1

# Load our local nx binary into the PATH, and the lib to start up the services
export PATH="${PATH}:${PWD}/node_modules/.bin"
. scripts/lib/services.sh

services_setup

nx e2e client-e2e $@
