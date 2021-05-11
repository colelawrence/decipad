#!/bin/bash

set -exuo pipefail

mkdir -p \
  tests/node_modules/@architect

rm -f \
  tests/node_modules/@architect/shared

ln -s \
  `../../node_modules/.bin/realpath src/shared` \
  tests/node_modules/@architect/shared

