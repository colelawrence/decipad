'use strict';

import { spawn } from 'child_process';
let child;
let started = false;
let stoppedResolve;

function start() {
  return new Promise((resolve, reject) => {
    if (child) {
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
      child = null;
    });

    child.on('error', (err) => {
      console.error('sandbox errored:', err);
      reject(err);
    });

    let output = '';

    child.stdout.on('data', (d) => {
      if (!started) {
        output += d;
        if (output.indexOf('Sandbox startup scripts ran') >= 0) {
          started = true;
          resolve();
        }
      } else {
        process.stdout.write('Sandbox: ' + d);
      }
    });

    child.stderr.on('data', (d) => {
      process.stderr.write(d);
    });
  });
}

function stop(code) {
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
