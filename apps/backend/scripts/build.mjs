#!/usr/bin/env node
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
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
    }
  }
  process.chdir(dir);
};

(async () => {
  await installLambdaDependencies();
})();
