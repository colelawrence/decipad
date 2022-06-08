#!/usr/bin/env node
import { globby } from 'globby';
import esbuild from 'esbuild';

const envVarNames = [
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_ANALYTICS_WRITE_KEY',
  'NEXT_PUBLIC_HOTJAR_SITE_ID',
  'GIT_COMMIT_HASH',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'JWT_SECRET',
  'SENTRY_DSN',
  'SENTRY_ENVIRONMENT',
  'DECI_SES_ACCESS_KEY_ID',
  'DECI_SES_SECRET_ACCESS_KEY',
  'DECI_INVITE_EXPIRATION_SECONDS',
  'DECI_KEY_VALIDATION_EXPIRATION_SECONDS',
  'DECI_FROM_EMAIL_ADDRESS',
  'DECI_APP_URL_BASE',
  'DECI_S3_ENDPOINT',
  'DECI_S3_ACCESS_KEY_ID',
  'DECI_S3_SECRET_ACCESS_KEY',
  'DECI_S3_PADS_BUCKET',
  'DECI_S3_ATTACHMENTS_BUCKET',
  'DECI_GOOGLESHEETS_API_KEY',
  'DECI_GOOGLESHEETS_CLIENT_ID',
  'DECI_GOOGLESHEETS_CLIENT_SECRET',
  'DISCORD_PUBLIC_KEY',
  'DISCORD_APP_ID',
  'NODE_OPTIONS',
  'ARC_STATIC_SPA',
];

function getEnvVar(name) {
  return process.env[name];
}

function getEnv() {
  return envVarNames.reduce((map, varName) => {
    const value = getEnvVar(varName);
    if (value) {
      map[varName] = value;
    }
    return map;
  }, {});
}

function printEnv(env) {
  for (const key of Object.keys(env)) {
    console.log(`${key} = ${JSON.stringify(env[key])}`);
  }
}

function getWatch() {
  return {
    onRebuild(error, result) {
      if (error) {
        console.error('Watch build failed:', error);
      } else {
        console.log('Watch build succeeded:', result);
      }
    },
  };
}

function envVarDefines(env) {
  const defines = {};
  for (const key of Object.keys(env)) {
    defines[`process.env.${key}`] = JSON.stringify(env[key] || '');
  }
  return defines;
}

async function esBuildOptions(env) {
  const watch = process.env.WATCH ? getWatch() : false;
  return {
    bundle: true,
    entryPoints: await globby([
      'libs/lambdas/src/http/*/index.ts',
      'libs/lambdas/src/http/*/index.js',
      'libs/lambdas/src/queues/*/index.ts',
      'libs/lambdas/src/ws/*/index.ts',
    ]),
    target: 'node16',
    platform: 'node',
    format: 'cjs',
    external: ['aws-sdk', '@vue/compiler-sfc'],
    legalComments: 'none',
    sourcemap: true,
    outdir: 'apps/backend/src',
    keepNames: true,
    define: envVarDefines(env),
    minify: !process.env.DEBUG && !!process.env.MINIFY,
    watch,
  };
}

const env = getEnv();
printEnv(env);
console.log('');

(async () => {
  const buildOptions = await esBuildOptions(env);
  console.log('esbuild options: ', buildOptions);
  console.log('');
  const result = await esbuild.build(buildOptions);
  console.log('Built successfully', result);
  if (buildOptions.watch) {
    console.log('Now watching for changes...');
  }
})();
