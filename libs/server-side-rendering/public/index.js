const { readFileSync } = require('node:fs');

const searchPaths = [
  'asset-manifest.json',
  'src/http/get-n-000notebookid/asset-manifest.json',
];

let manifest;
for (const path of searchPaths) {
  try {
    manifest = JSON.parse(readFileSync(path));
  } catch {
    // do nothing
  }
}

if (!manifest) {
  throw new Error(
    'asset manifest not found in ' +
      JSON.stringify(searchPaths.map((sp) => process.cwd() + '/' + sp))
  );
}

module.exports = require('.' + manifest.files['main.js']);
