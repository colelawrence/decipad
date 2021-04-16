#!/bin/bash

set -exuo pipefail

mkdir -p \
  src/kafka-consumers/consumer1-topic1/node_modules/@architect

rm -f \
  src/kafka-consumers/consumer1-topic1/node_modules/@architect/shared

ln -s -T \
  "$(realpath src/shared)" \
  src/kafka-consumers/consumer1-topic1/node_modules/@architect/shared

