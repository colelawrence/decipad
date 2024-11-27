#!/usr/bin/env bash

# Wait for the backend
sleep_duration="${SLEEP_TIME:=12}"
echo Sleeping for "$sleep_duration"... waiting for backend.
sleep "$sleep_duration"

export DISABLE_ESLINT_PLUGIN=true
export TSC_COMPILE_ON_ERROR=true
export VITE_DECI_APP_URL_BASE=http://localhost:3000

(cd ../../; yarn build:wasm)
yarn vite
