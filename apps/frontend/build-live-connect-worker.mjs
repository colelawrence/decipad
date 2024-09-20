import { build } from 'esbuild';

await build({
  entryPoints: ['../../libs/live-connect/src/worker/LiveConnect.worker.ts'],
  bundle: true,
  outfile: '../../libs/live-connect/src/worker/LiveConnect-5.worker.bundle.js',
  treeShaking: true,
  minify: true,
  metafile: true,
  format: 'esm',
  logLevel: 'info',
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_GOOGLESHEETS_API_KEY':
      `"${process.env.VITE_GOOGLESHEETS_API_KEY}"` ?? '""',
  },

  loader: {
    '.wasm': 'empty',
  },
});

// console.log(JSON.stringify(out.metafile));
