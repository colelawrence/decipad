#!/bin/bash

set -euo pipefail

export PATH="${PATH}:./node_modules/.bin"

for stack in "${@:-}"
do
  if [[ -z "$stack" ]]; then
    echo "please tell me a stack name"
  else
    echo "removing stack \"$stack\"..."

    aws cloudformation delete-stack --stack-name  "$stack" # --retain-resources "StaticBucket"

    while :
    do
      echo -n "."
      sleep 10
      set +e
      status=`aws cloudformation describe-stacks --stack-name "$stack" | jqn  'property("Stacks") | head | property("StackStatus")'`
      retVal=$?
      set -e
      if [[ $retVal -ne 0 ]]; then
        echo "something went wrong. Assuming that aws errored because the stack was removed.."
        break
      fi
      if [ "$status" == "DELETED" ]; then
        echo "deleted"
        break
      fi
      if [ "$status" == "DELETE_FAILED" ]; then
        echo "delete failed"
        set +e
        pending_resource_count=`aws cloudformation list-stack-resources --stack-name "$stack" | jqn --color=false 'property("StackResourceSummaries") | filter((r) => r.ResourceStatus != "DELETE_COMPLETE") | map((r) => r.LogicalResourceId) | property("length")'`
        retVal=$?
        set -e
        if [[ $retVal -ne 0 ]]; then
          echo "something went wrong. Assuming that aws errored because the stack was removed.."
          break
        fi
        echo "pending resource count: $pending_resource_count";
        if [ "$pending_resource_count" == "1" ]; then
          echo "only static bucket missing"
          bucket_name=`aws cloudformation list-stack-resources --stack-name "$stack" | jqn --color=false 'property("StackResourceSummaries") | filter((r) => r.LogicalResourceId == "StaticBucket") | map((r) => r.PhysicalResourceId) | head'`
          aws cloudformation delete-stack --stack-name  "$stack" --retain-resources "StaticBucket"
          ./scripts/aws-s3-remove-bucket.sh "$bucket_name"
          echo "stack ${stack} removed"
          break
        fi
      fi
    done
  fi
done
