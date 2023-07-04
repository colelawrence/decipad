#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console  */
import { spawn } from 'node:child_process';
import { join, dirname, resolve as fsResolve } from 'node:path';
import { cp } from 'node:fs/promises';
import chalk from 'chalk';

const dirName = dirname(new URL(import.meta.url).pathname);

const buildPath = '../../dist/server-side-rendering/http/get-n-000notebookid';
const targetPath = '../../apps/backend/src/http/get-n-000notebookid';

const buildSSRLambdas = async () => {
  process.chdir(join(dirName, '..'));
  console.log('in', process.cwd());

  return new Promise((resolve, reject) => {
    console.log('Building server-side rendering lambdas...');
    spawn('../../node_modules/.bin/craco', ['build', '--debug'], {
      encoding: 'utf-8',
      stdio: [process.stdin, process.stdout, process.stderr],
      env: {
        ...process.env,
        CI: undefined,
        BUILD_PATH: fsResolve(buildPath),
      },
    }).once('close', (code) => {
      if (code) {
        reject(new Error(`Build returned error code ${code}`));
      } else {
        console.log(chalk.green('Finished building server-side lambdas'));
        cp(`${buildPath}/`, targetPath, {
          recursive: true,
          force: true,
        })
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

buildSSRLambdas().finally(() => {
  console.log('Finished building SSR lambdas');
});
