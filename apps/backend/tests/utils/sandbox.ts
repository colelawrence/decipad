import { spawn, ChildProcess } from 'child_process';
import assert from 'assert';
import dotenv from 'dotenv';
import { join } from 'path';
import lockingFile from './locking-file';

let child: ChildProcess | undefined;
let started = false;
let stoppedResolve: (code: number | null) => void;

dotenv.config({
  path: join(__dirname, '..', '..', '.env'),
});

const workerId = Number(process.env.JEST_WORKER_ID);
assert(!!workerId, 'need JEST_WORKER_ID env var to be defined');

const portBase = '' + (3333 + workerId * 100 - Math.ceil(Math.random() * 100));
process.env.DECI_PORT = process.env.PORT = portBase;
process.env.NEXTAUTH_URL = `http://localhost:${process.env.portBase}/api/auth`;
process.env.ARC_EVENTS_PORT = portBase + '1'; // just like Architect does
process.env.ARC_TABLES_PORT = portBase + '2'; // just like Architect does
process.env.DECI_S3_ENDPOINT = `localhost:${portBase + '3'}`;

const verbose = !!process.env.DECI_VERBOSE;

const lockPath = join(__dirname, '..', '..', 'app.arc');
const lockUnlock = lockingFile(lockPath);
let stopping = false;

async function start(): Promise<void> {
  await lockUnlock(_start());
}

function _start(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (child !== undefined) {
        throw new Error('already started');
      }

      child = spawn(
        './node_modules/.bin/arc',
        [
          'sandbox',
          '--disable-symlinks',
          '--no-hydrate',
          '--confirm',
          '--port',
          process.env.PORT!,
        ],
        { stdio: 'pipe', env: process.env }
      );

      child.once('exit', (code) => {
        started = false;
        if (stoppedResolve) {
          stoppedResolve(code);
        }
        if (!stopping && code) {
          console.error(
            `Sandbox ${workerId} terminated with error code ` + code
          );
          reject(
            new Error(`Sandbox ${workerId} terminated with error code ` + code)
          );
        }
        child = undefined;
      });

      child.on('error', (err) => {
        console.error('sandbox errored:', err);
        reject(err);
      });

      let output = '';

      child.stdout!.on('data', (d) => {
        if (!started) {
          output += d;
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

      child.stderr!.on('data', (d) => {
        process.stderr.write(d);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function stop() {
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
