#!/bin/bash

set -euo pipefail

cd ../..
npm run build:backend
cd apps/backend
NEXTAUTH_URL=http://localhost:4200 ./node_modules/.bin/sandbox
