#!/usr/bin/env node
import { exec, spawn } from 'child_process';
import esbuild from 'esbuild';
import { globby } from 'globby';
import stringify from 'json-stringify-safe';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pExec = promisify(exec);

const envVarNames = [
  'NEXTAUTH_URL',
  'VITE_ANALYTICS_WRITE_KEY',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_HOTJAR_SITE_ID',
  'GIT_COMMIT_HASH',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'JWT_SECRET',
  'SENTRY_DSN',
  'SENTRY_ENVIRONMENT',
  'MAILERSEND_API_KEY',
  'DECI_INVITE_EXPIRATION_SECONDS',
  'DECI_KEY_VALIDATION_EXPIRATION_SECONDS',
  'DECI_FROM_EMAIL_ADDRESS',
  'DECI_APP_URL_BASE',
  'DECI_S3_ENDPOINT',
  'DECI_S3_ACCESS_KEY_ID',
  'DECI_S3_SECRET_ACCESS_KEY',
  'DECI_S3_PADS_BUCKET',
  'DECI_S3_PAD_BACKUPS_BUCKET',
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
  'GIPHY_API_KEY',
  'UNSPLASH_API_KEY',
  'REPLICATE_API_KEY',
  'OPENAI_DECIPAD_GPT_BEARER_KEY',
  'STRIPE_API_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_EXTRA_CREDITS_PRODUCT_ID',
  'STRIPE_SUBSCRIPTIONS_PRODUCT_ID',
  'VITE_STRIPE_CUSTOMER_PORTAL_LINK',
  'VITE_STRIPE_API_KEY',
  'DISCORD_FEEDBACK_CHANNEL_TOKEN',
  'DISCORD_FEEDBACK_CHANNEL_ID',
  'DEBUG',
  'DECI_MAX_CREDITS_FREE',
  'DECI_MAX_CREDITS_PRO',
  'DECI_MAX_QUERIES_FREE',
  'DECI_MAX_QUERIES_PRO',
  'DECI_TOKENS_TO_CREDITS',
  'WORKSPACE_PRO_PLAN',
  'WORKSPACE_FREE_PLAN',
  'WORKSPACE_FREE_PLAN_NAME',
  'DECI_MAX_ATTACHMENT_SIZE',

  'NOTION_CLIENT_ID',
  'NOTION_CLIENT_SECRET',
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
      'libs/lambdas/src/scheduled/*/index.ts',
    ]),
    target: 'node18',
    platform: 'node',
    format: 'cjs',
    external: [
      'aws-sdk',
      '@aws-sdk/*',
      'sharp',
      'canvas',
      'jsdom',
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
    logOverride: {
      'empty-import-meta': 'silent',
    },
    loader: {
      '.woff': 'file',
      '.woff2': 'file',
      '.svg': 'file',
      '.png': 'file',
      '.wasm': 'file',
    },
    treeShaking: true,
    plugins: [
      {
        name: 'perf',
        setup(build) {
          build.onStart(() => {
            console.log('build started');
            console.time('Esbuild Time:');
          });
          build.onEnd((result) => {
            console.log(`build ended with ${result.errors.length} errors`);
            console.timeEnd('Esbuild Time:');
          });
        },
      },
    ],
  };
}

const env = getEnv();
printEnv(env);
console.log('');

const installLambdaDependencies = async () => {
  await pExec(join(__dirname, '..', 'apps', 'backend', 'scripts', 'build.mjs'));
};

const hackyGraphqlBuild = async () => {
  await pExec(join(__dirname, 'hacky-build-graphql.sh'));
};

const buildTraditionalLambdas = async () => {
  const { watch, ...buildOptions } = await esBuildOptions(env);

  if (watch) {
    console.log('Now watching for changes...');
    const ctx = await esbuild.context({ ...buildOptions });
    await ctx.watch();
  } else {
    // console.log('esbuild options: ', buildOptions);
    // console.log('');
    await esbuild.build(buildOptions);
  }
};

const buildSSRLambdas = async (watch) => {
  spawn('nx', ['build', 'server-side-rendering'], {
    stdio: [process.stdin, process.stdout, process.stderr],
  }).once('close', (code) => {
    if (code) {
      throw new Error('done with error code ' + code);
    } else {
      console.log('Done building server-side rendering.');
    }
  });
};

(async () => {
  await hackyGraphqlBuild();
  await installLambdaDependencies();
  await buildTraditionalLambdas();
  if (process.env.DECI_SSR) {
    // await buildSSRLambdas();
  }
})();
