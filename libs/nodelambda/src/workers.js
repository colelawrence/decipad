const { Worker } = require('worker_threads');
const assert = require('assert');
const watch = require('node-watch');

const workerPath = __dirname + '/run.js';
const workers = new Map();

function createWorkerFor(functionName, env, update) {
  const workQueue = [];
  const replyQueue = [];

  const workerData = {
    arcConfig: JSON.parse(env.__ARC_CONFIG__),
    arcContext: JSON.parse(env.__ARC_CONTEXT__),
    functionPath: functionName,
  };

  const workerOptions = {
    env,
    stdin: true,
    stdout: true,
    stderr: true,
    workerData,
  };

  const fn = {
    worker: new Worker(workerPath, workerOptions),
    ready: false,
    working: false,
    work,
  };

  const w = watch(functionName, () => {
    update.status(`function ${functionName} changed`);
    w.close();
    fn.worker.terminate();
  });

  fn.worker.on('message', (message) => {
    if (message === 'ready') {
      assert(!fn.ready, 'worker is already ready');
      fn.ready = true;
      maybeWork();
      return;
    }
    assert(
      fn.working,
      'worker should be working when getting a response message'
    );
    replyWith(null, message);
  });

  fn.worker.once('error', (err) => {
    while (replyQueue.length > 0) {
      replyWith(err);
    }
  });

  fn.worker.once('exit', () => {
    update.status(`worker exited: ${functionName} `, functionName);
    const err = new Error('Worker exited prematurely');
    while (replyQueue.length > 0) {
      replyWith(err);
    }
    workers.delete(functionName);
  });

  return fn;

  function maybeWork() {
    if (workQueue.length === 0 || fn.working) {
      return;
    }
    fn.working = true;
    const work = workQueue.splice(0, 1)[0];
    fn.worker.postMessage(work);
  }

  function replyWith(error, response) {
    fn.working = false;
    const reply = replyQueue.splice(0, 1)[0];
    reply(error, response);
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
