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
});

// Important that this one comes second.
await build({
  entryPoints: ['../../libs/live-connect/src/LiveConnect-2.worker.ts'],
  bundle: true,
  outfile: '../../libs/live-connect/src/LiveConnect-2.worker.bundle.js',
  treeShaking: true,
  minify: true,
  metafile: true,
  format: 'esm',
  logLevel: 'info',
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
});

// console.log(JSON.stringify(out.metafile));
