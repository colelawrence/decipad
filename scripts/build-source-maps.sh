#!/bin/bash

set -euo pipefail

echo "Building storybook..."
yarn build:storybook

echo "Building the backend..."
yarn build:backend

echo "Building frontend..."
yarn build:frontend

echo "Creating directory dist/sourcemaps"
mkdir dist/sourcemaps/

echo "Copying all source to dist/sourcemaps"
find dist -type f -iname '*.map' -print0 | sed -e 's/\.map//g' | xargs -0 -I _ cp _ dist/sourcemaps/

echo "Copying all maps to dist/sourcemaps"
find dist -type f -iname '*.map' -print0 | xargs -0 -I _ cp _ dist/sourcemaps/
