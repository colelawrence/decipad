#!/bin/bash

set -euo pipefail

aws s3 cp --no-progress apps/backend/sam.yaml "${SAM_LOCATION}/"
aws s3 cp --no-progress apps/backend/sam.json "${SAM_LOCATION}/"
