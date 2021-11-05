#!/bin/bash

set -euo pipefail

REMOTE_FILE="${SAM_LOCATION}/sam.yaml"
LOCAL_FILE=apps/backend/sam.yaml
if [ -f "${LOCAL_FILE}" ]; then
  aws s3 cp --no-progress "${LOCAL_FILE}" "${REMOTE_FILE}"
fi

REMOTE_FILE="${SAM_LOCATION}/sam.json"
LOCAL_FILE=apps/backend/sam.JSON
if [ -f "${LOCAL_FILE}" ]; then
  aws s3 cp --no-progress "${LOCAL_FILE}" "${REMOTE_FILE}"
fi
