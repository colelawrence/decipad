#!/bin/bash

set -euo pipefail

cd ../..
npm run build:backend
cd apps/backend
./node_modules/.bin/sandbox