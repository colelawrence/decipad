#!/bin/bash

set -euo pipefail

npx esbuild --bundle --target=node18 --platform=node --format=cjs --outdir=build src/actions/index.ts

if [[ -z "${DECI_DOMAIN:-}" ]]; then
    echo "Must provide DECI_DOMAIN in environment"
    exit 1
fi

pwd

ESCAPED_DOMAIN=`printf '%s' "$DECI_DOMAIN" | sed 's/[\/]/\\\\\//g'`
echo $ESCAPED_DOMAIN

PUBLIC_TARGET_DIR=../../apps/backend/public
PLUGIN_TARGET_DIR=${PUBLIC_TARGET_DIR}/.well-known
mkdir -p $PLUGIN_TARGET_DIR


cat public/ai-plugin.json | sed "s/\[DOMAIN\]/$ESCAPED_DOMAIN/g" > ${PLUGIN_TARGET_DIR}/ai-plugin.json
./scripts/api-spec.js > ${PUBLIC_TARGET_DIR}/openapi.yaml

PUBLIC_TARGET_DIR=../../apps/frontend/public
PLUGIN_TARGET_DIR=${PUBLIC_TARGET_DIR}/.well-known
mkdir -p $PLUGIN_TARGET_DIR


cat public/ai-plugin.json | sed "s/\[DOMAIN\]/$ESCAPED_DOMAIN/g" > ${PLUGIN_TARGET_DIR}/ai-plugin.json
./scripts/api-spec.js > ${PUBLIC_TARGET_DIR}/openapi.yaml
