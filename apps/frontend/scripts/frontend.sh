#!/bin/bash

# Wait for the backend
sleep 12

export DISABLE_ESLINT_PLUGIN=true
export TSC_COMPILE_ON_ERROR=true

node build-worker.mjs
yarn vite
