import { build } from 'esbuild';
import { wasmLoader } from 'esbuild-plugin-wasm';

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

  plugins: [wasmLoader()],
});

// Important that this one comes second.
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
  },

  plugins: [wasmLoader({ mode: 'embedded' })],
});

// console.log(JSON.stringify(out.metafile));
