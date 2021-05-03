#!/bin/bash

set -euo pipefail

# Make sure the bucket exists and is accessible. Important to check due to "|| true" below
aws s3api head-bucket --bucket decipad-backend-sam

aws s3 rm "${SAM_LOCATION}" --recursive || true
