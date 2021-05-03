#!/bin/bash

set -exuo pipefail

aws s3 cp "${SAM_LOCATION}/sam.yaml" apps/backend/.
aws s3 cp "${SAM_LOCATION}/sam.json" apps/backend/.
