#!/usr/bin/env node
import esbuild from 'esbuild';

(async () => {
  console.log('Building API spec...');
  await esbuild.build({
    bundle: true,
    target: 'node18',
    platform: 'node',
    format: 'cjs',
    outdir: 'build',
    entryPoints: ['src/apiSpec/index.ts'],
    external: ['aws-sdk', '@aws-sdk'],
    alias: {
      '@decipad/remote-computer': '@decipad/computer',
    },
    loader: {
      '.wasm': 'file',
    },
  });

  console.log('Finished building API spec...');
})();
