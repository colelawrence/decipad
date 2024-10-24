#!/usr/bin/env bash

set -euo pipefail

export PATH="${PATH}:./node_modules/.bin"

echo "Querying AWS about existing stacks..."

pr_list=`aws cloudformation list-stacks --output json | jqn --color=false 'property("StackSummaries") | filter ((s) => s.StackStatus != "DELETE_COMPLETE") | map((s) => s.StackName) | map((s) => s.split("DecipadBackendStaging")[1]) | map((s) => Number(s).toString()) | filter((s) => s !== 'NaN') | join(" ")'`

for pr_number in $pr_list
do
  echo "Checking if PR ${pr_number} exists..."
  set +e
  pr_closed=`gh pr view ${pr_number} --json closed --jq '.closed'`
  retVal=$?
  set -e
  if [[ $retVal -ne 0 ]]; then
    echo "PR ${pr_number} does not exist"
  else
    echo "PR ${pr_number} exists"
    if [[ "$pr_closed" == "true" ]]; then
      echo "PR ${pr_number} is closed. Removing the stack..."
      ./scripts/aws-delete-stack.sh "${pr_number}"
    else
    echo "PR ${pr_number} is NOT closed"
    fi
  fi
done
