module.exports = {
  type: 'bundle', // bundle or transform (see description above)
  esbuild: {
    // Any esbuild build or transform options go here
    target: 'node18',
    platform: 'node',
    format: 'cjs',
    bundle: true,
  },
};
