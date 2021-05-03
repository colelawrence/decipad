#!/bin/bash

set -exuo pipefail

aws s3 cp apps/backend/sam.yaml "${SAM_LOCATION}/"
aws s3 cp apps/backend/sam.json "${SAM_LOCATION}/"
