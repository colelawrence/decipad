/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

import { spawn, ChildProcess } from 'child_process';
import assert from 'assert';
import { join } from 'path';
import { Env } from './sandbox-env';
import { Config } from './config';

let child: ChildProcess | undefined;
let started = false;
let stoppedResolve: (code: number | null) => void;

const workerId = Number(process.env.JEST_WORKER_ID);
assert(!!workerId, 'need JEST_WORKER_ID env var to be defined');

const verbose = !!process.env.DECI_VERBOSE;

let stopping = false;

function start(env: Env, config: Config): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (child !== undefined) {
        throw new Error('already started');
      }

      // change the working dir to apps/backend
      const sandboxWorkingDirPath = join(
        __dirname,
        '..',
        '..',
        '..',
        'apps',
        'backend'
      );

      // define the full path for the sandbox executable
      const sandboxExecFilePath = join(
        __dirname,
        '..',
        '..',
        '..',
        'node_modules',
        '.bin',
        'sandbox'
      );

      // start the sandbox process
      child = spawn(
        sandboxExecFilePath,
        ['--disable-symlinks', '--confirm', '--port', `${config.apiPort}`],
        {
          stdio: 'pipe',
          env,
          cwd: sandboxWorkingDirPath,
        }
      );

      child.once('exit', (code) => {
        started = false;
        if (stoppedResolve) {
          stoppedResolve(code);
        }
        if (!stopping && code) {
          console.error(
            `Sandbox ${workerId} terminated with error code ${code}`
          );
          console.error(output);
          reject(
            new Error(`Sandbox ${workerId} terminated with error code ${code}`)
          );
        }
        child = undefined;
      });

      child.on('error', (err) => {
        console.error('sandbox errored:', err);
        reject(err);
      });

      let output = '';

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      child.stdout!.on('data', (d) => {
        output += d;
        if (!started) {
          if (output.indexOf('Sandbox startup scripts ran') >= 0) {
            started = true;
            resolve();
          }
        }
        if (verbose || started) {
          const dstr = d.toString();
          let statement = dstr.trim();
          if (statement) {
            if (dstr.endsWith('\n')) {
              statement += '\n';
            }
            if (
              verbose ||
              (!statement.includes('ws/connect') &&
                !statement.includes('ws/default') &&
                !statement.includes('ws/disconnect') &&
                !statement.includes('completed') &&
                !statement.includes('received event') &&
                !statement.includes('startup scripts ran'))
            ) {
              process.stdout.write(
                `Sandbox ${workerId}: [${new Date().toISOString()}] ${statement}`
              );
            }
          }
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      child.stderr!.on('data', (d) => {
        process.stderr.write(d);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function stop(): Promise<unknown> {
  if (!child) {
    return Promise.resolve();
  }
  stopping = true;
  const stoppedPromise = new Promise((resolve) => {
    stoppedResolve = resolve;
  });
  child.kill('SIGKILL');
  return stoppedPromise;
}

export default { start, stop };
