#!/usr/bin/env node
import { exec } from 'child_process';
import esbuild from 'esbuild';
import globby from 'globby';
import stringify from 'json-stringify-safe';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envVarNames = [
  'DEBUG',
  'NEXTAUTH_URL',
  'REACT_APP_ANALYTICS_WRITE_KEY',
  'REACT_APP_HOTJAR_SITE_ID',
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
  'INTERCOM_SECRET_ID',
  'OPENAI_API_KEY',
  'STRIPE_API_KEY',
  'STRIPE_WEBHOOK_SECRET',
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
    console.log(`${key} = ${stringify(env[key])}`);
  }
}

function envVarDefines(env) {
  const defines = {};
  for (const key of Object.keys(env)) {
    defines[`process.env.${key}`] = JSON.stringify(env[key] || '');
  }
  return defines;
}

async function esBuildOptions(env) {
  const watch = Boolean(process.env.WATCH);
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
    external: [
      'aws-sdk',
      'sharp',
      'better-sqlite3',
      'sqlite3',
      '@vue/compiler-sfc',
      'mock-aws-s3',
      'nock',
      'pg-query-stream',
      'mysql2',
      'pg-native',
      'oracledb',
    ],
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

const installLambdaDependencies = async () => {
  await promisify(exec)(
    join(__dirname, '..', 'apps', 'backend', 'scripts', 'build.mjs')
  );
};

const buildLambdas = async () => {
  const { watch, ...buildOptions } = await esBuildOptions(env);

  if (watch) {
    console.log('Now watching for changes...');
    const ctx = await esbuild.context({ ...buildOptions });
    await ctx.watch();
  } else {
    // console.log('esbuild options: ', buildOptions);
    // console.log('');
    const result = await esbuild.build(buildOptions);
    console.log('Built successfully', result);
  }
};

(async () => {
  await installLambdaDependencies();
  await buildLambdas();
})();
