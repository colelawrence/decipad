#!/usr/bin/env bash

# URL of your Google Sheets script endpoint
URL="${UPLOAD_PERFORMANCE_RESULTS_GSHEETS_MACRO_URL}"

if [[ -z "${URL:-}" ]]; then
    echo "Must provide a UPLOAD_PERFORMANCE_RESULTS_GSHEETS_MACRO_URL env var"
    exit 1
fi

# Path to your JSON file
JSON_FILE="./performance-results/performance-results.json"

# Send the POST request with the JSON data
curl -X POST -H "Content-Type: application/json" -d @"${JSON_FILE}" "${URL}"
