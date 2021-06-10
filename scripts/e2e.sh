#!/bin/bash

set -euo pipefail

# Load our local nx binary into the PATH, and the lib to start up the services
export PATH="${PWD}/node_modules/.bin:${PATH}"
. scripts/lib/services.sh

services_setup

cd apps/client-e2e && nx e2e client-e2e $@
