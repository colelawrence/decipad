#!/bin/bash

set -euo pipefail

export PATH="${PATH}:./node_modules/.bin"

for stack in "${@:-}"
do
  if [[ -z "$stack" ]]; then
    echo "please tell me a stack name"
  else
    if [[ $stack == "DecipadBackendStaging" || $stack == "DecipadBackendStagingAlpha" ]]; then
      echo "Invalid stack name ${stack}"
      return 1
    fi
    echo "removing parameters for stack \"$stack\"..."

    names=`aws ssm describe-parameters --parameter-filters="Key=Name,Option=Contains,Values=/${stack}/" | jqn --color=false 'property("Parameters") | map("Name") | join("\n")'`

    for name in $names
    do
      echo "removing ${name}"
      aws ssm delete-parameter --name "${name}"
    done
  fi

done
