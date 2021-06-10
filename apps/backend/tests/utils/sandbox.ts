'use strict';

import { spawn, ChildProcess } from 'child_process';
let child: ChildProcess | undefined;
let started = false;
let stoppedResolve: (code: number | null) => void;

function start(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (child !== undefined) {
      throw new Error('already started');
    }

    child = spawn('./node_modules/.bin/arc', ['sandbox'], { stdio: 'pipe' });

    child.once('exit', (code) => {
      started = false;
      if (stoppedResolve) {
        stoppedResolve(code);
      }
      if (code) {
        console.error('Sandbox terminated with error code ' + code);
        reject(new Error('Sandbox terminated with error code ' + code));
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
      } else {
        const dstr = d.toString();
        let statement = dstr.trim();
        if (statement) {
          if (dstr.endsWith('\n')) {
            statement += '\n';
          }
          if (
            !statement.includes('Sandbox ws/connect') &&
            !statement.includes('Sandbox ws/default') &&
            !statement.includes('Sandbox ws/disconnect') &&
            !statement.endsWith('completed\n') &&
            !statement.endsWith('received event\n')
          ) {
            process.stdout.write(
              `Sandbox: [${new Date().toISOString()}] ${statement}`
            );
          }
        }
      }
    });

    child.stderr!.on('data', (d) => {
      process.stderr.write(d);
    });
  });
}

function stop(code: number | undefined) {
  if (!child) {
    throw new Error("hasn't started yet");
  }
  const stoppedPromise = new Promise((resolve) => {
    stoppedResolve = resolve;
  });
  child.kill(code);
  return stoppedPromise;
}

export default { start, stop };
