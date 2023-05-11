#!/bin/bash

set -euo pipefail

for bucketName in "${@:-}"
do
  bucket="s3://$bucketName"
  echo "removing $bucket"

  aws s3 rm --recursive $bucket
  aws s3 rb $bucket
done
