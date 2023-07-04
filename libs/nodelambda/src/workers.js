const { Worker } = require('worker_threads');
const assert = require('assert');
const watch = require('node-watch');

const workerPath = `${__dirname}/run.js`;
const workers = new Map();

function createWorkerFor(functionName, env, update) {
  const workQueue = [];
  const replyQueue = [];

  if (functionName.endsWith('.mjs')) {
    // eslint-disable-next-line no-param-reassign
    functionName =
      // eslint-disable-next-line prefer-template
      functionName.substring(0, functionName.indexOf('.mjs')) + '.js';
  }

  const workerData = {
    functionPath: functionName,
  };

  const workerOptions = {
    env,
    workerData,
    stdout: true,
    stderr: true,
  };

  const fn = {
    worker: new Worker(workerPath, workerOptions),
    ready: false,
    working: false,
    terminating: false,
    work,
  };

  const dir = functionName.slice(0, functionName.lastIndexOf('/'));

  const w = watch(
    dir,
    {
      recursive: true,
    },
    () => {
      update.status(`function ${functionName} changed`);
      w.close();
      fn.terminating = true;
      fn.worker.terminate();
    }
  );

  fn.worker.on('message', (message) => {
    if (message === 'ready') {
      assert(!fn.ready, 'worker is already ready');
      fn.ready = true;
      maybeWork();
      return;
    }
    assert(fn.ready, 'should be ready when getting a response message');
    assert(
      fn.working,
      'worker should be working when getting a response message'
    );
    replyWith(null, message || '');
  });

  fn.worker.once('error', (err) => {
    update.error(`worker ${functionName} error:\n${err.stack}`);
    while (replyQueue.length > 0) {
      replyWith(err);
    }
  });

  fn.worker.once('exit', () => {
    let err;
    if (!fn.terminating) {
      update.error(`worker exited prematurely: ${functionName} `, functionName);
      err = new Error('Worker exited prematurely');
    } else {
      err = new Error('Worker exited without reply');
      update.status(`worker exited: ${functionName} `, functionName);
    }
    while (replyQueue.length > 0) {
      replyWith(err);
    }
    workers.delete(functionName);
  });

  fn.worker.stderr.on('data', (d) => {
    update.error(`${functionName}:\n${d}`);
  });
  fn.worker.stdout.on('data', (d) => {
    update.status(`${functionName}:\n${d}`);
  });

  return fn;

  function maybeWork() {
    if (workQueue.length === 0 || !fn.ready || fn.working) {
      return;
    }
    fn.working = true;
    const nextWork = workQueue.splice(0, 1)[0];
    fn.worker.postMessage(nextWork);
  }

  function replyWith(error, response) {
    fn.working = false;
    const reply = replyQueue.splice(0, 1)[0];
    reply(error, response || '');
    maybeWork();
  }

  function work(request, callback) {
    workQueue.push(request);
    replyQueue.push(callback);
    maybeWork();
  }
}

module.exports.workerFor = function workerFor(functionName, env, update) {
  let fn = workers.get(functionName);
  if (!fn) {
    fn = createWorkerFor(functionName, env, update);
    workers.set(functionName, fn);
  }

  return fn;
};
