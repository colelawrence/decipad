#!/bin/bash

set -euo pipefail

aws s3 cp --no-progress apps/backend/sam.yaml "${SAM_LOCATION}/sam.yaml"
aws s3 cp --no-progress apps/backend/sam.json "${SAM_LOCATION}/sam.json"
