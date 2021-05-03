#!/bin/bash

set -euo pipefail

# Make sure the bucket exists and is accessible. Important to check due to "|| true" below
aws s3api head-bucket --bucket decipad-backend-sam

# Need to ignore failure because the files might not exist yet
aws s3 cp --no-progress "${SAM_LOCATION}/sam.yaml" apps/backend/. || true
aws s3 cp --no-progress "${SAM_LOCATION}/sam.json" apps/backend/. || true
