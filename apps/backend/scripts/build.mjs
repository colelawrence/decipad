#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { join, dirname } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pExec = promisify(exec);

const lambdasRequiringInstall = ['post-api-pads-000padid-images'];

const installLambdaDependencies = async () => {
  const dir = process.cwd();

  for (const lambda of lambdasRequiringInstall) {
    process.chdir(join(__dirname, '..', 'src', 'http', lambda));
    await pExec('npm install');
    if (process.env.CI) {
      // building for Lambda: https://sharp.pixelplumbing.com/install#aws-lambda
      await pExec('rm -rf node_modules/sharp');
      await pExec(
        'SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp'
      );
      const lambdaImageLayer = process.env.DECI_IMAGE_LAMBDA_LAYER;
      console.log(`Using AWS Lambda image layer ${lambdaImageLayer}`);
      if (!lambdaImageLayer) {
        throw new Error('Need env var DECI_IMAGE_LAMBDA_LAYER defined');
      }
      await pExec(
        `sed -i '/s/arn:aws:lambda:eu-west-2:861969788890:layer:sharp:2/${lambdaImageLayer}/g' config.arc`
      );
    }
  }
  process.chdir(dir);
};

(async () => {
  await installLambdaDependencies();
})();
