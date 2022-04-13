#!/bin/bash

set -euo pipefail

bucket="s3://$1"
echo "removing $bucket"

aws s3 rm --recursive $bucket
aws s3 rb $bucket
