#!/bin/bash

set -euo pipefail

FILE="${SAM_LOCATION}/sam.yaml"
if [ -f "${FILE}" ]; then
  aws s3 cp --no-progress apps/backend/sam.yaml "${FILE}"
fi

FILE="${SAM_LOCATION}/sam.json"
if [ -f "${FILE}" ]; then
  aws s3 cp --no-progress apps/backend/sam.yaml "${FILE}"
fi
