import { build } from 'esbuild';

await build({
  entryPoints: ['../../libs/live-connect/src/notebook/index.ts'],
  bundle: true,
  outfile: '../../libs/live-connect/src/notebook.bundle.js',
  treeShaking: true,
  minify: false,
  metafile: true,
  format: 'esm',
  logLevel: 'info',
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.wasm': 'file',
  },
});

// Important that this one comes second.
await build({
  entryPoints: ['../../libs/live-connect/src/LiveConnect-2.worker.ts'],
  bundle: true,
  outfile: '../../libs/live-connect/src/LiveConnect-2.worker.bundle.js',
  treeShaking: true,
  minify: false, // TODO CHANGE FOR NOW
  metafile: true,
  format: 'esm',
  logLevel: 'info',
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },

  loader: {
    '.wasm': 'file',
  },
});

// console.log(JSON.stringify(out.metafile));
