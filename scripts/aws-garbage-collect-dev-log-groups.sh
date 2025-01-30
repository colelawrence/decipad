#!/usr/bin/env bash

set -euo pipefail

export PATH="${PATH}:./node_modules/.bin"

echo "Querying AWS about existing log groups..."

log_group_list=`aws logs describe-log-groups --output json --max-items 1000 | jqn --color=false 'property("logGroups") | map((s) => s.logGroupName) | join(" ")'`

echo $log_group_list

for log_group in $log_group_list
do
  echo "Checking if PR exists for log group ${log_group}"
  if [[ "$log_group" =~ /aws/lambda/DecipadBackendStaging([0-9]+) ]]; then
    pr_number="${BASH_REMATCH[1]}"
    echo "PR number: ${pr_number}"
    set +e
    pr_closed=`gh pr view ${pr_number} --json closed --jq '.closed'`
    retVal=$?
    set -e
    if [[ $retVal -ne 0 ]]; then
      echo "PR ${pr_number} does not exist"
    else
      echo "PR ${pr_number} exists"
      if [[ "$pr_closed" == "true" ]]; then
        echo "PR ${pr_number} is closed. Removing the log group..."
        aws logs delete-log-group --log-group-name "${log_group}"
      else
        echo "PR ${pr_number} is NOT closed"
      fi
    fi
  fi
done