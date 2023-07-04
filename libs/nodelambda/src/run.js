/* eslint-disable no-console */
const { parentPort, workerData } = require('worker_threads');
const { join } = require('path');
const { existsSync: exists, readFileSync: read } = require('fs');

let { functionPath } = workerData;

if (functionPath.endsWith('.mjs')) {
  functionPath = `${functionPath.substring(
    0,
    functionPath.indexOf('.mjs')
  )}.js`;
}

const handlerFunction = 'handler';
const cwd = process.cwd();
let fn = loadFunction();

/* Enumerate package files */
const pkg = (dir) =>
  exists(join(dir, 'package.json')) &&
  JSON.parse(read(join(dir, 'package.json')));
const lambdaPackage = pkg(cwd);

const debug = [{ note: 'Execution metadata', cwd, lambdaPackage }];

function callback(err, result) {
  if (err) console.log(err);
  const payload = err
    ? { name: err.name, message: err.message, stack: err.stack }
    : result;
  if (payload) payload.__DEP_ISSUES__ = [];
  if (payload) payload.__DEP_DEBUG__ = debug;

  parentPort.postMessage(payload);
}

parentPort.on('message', (event) => {
  let calledback = false;
  const callbackGuard = (err, result) => {
    if (!calledback) {
      calledback = true;
      callback(err, result);
    }
  };
  if (!fn) {
    fn = loadFunction();
  }
  if (!fn) {
    callbackGuard(
      new Error(`Could not find handler for function ${functionPath}`)
    );
    return;
  }
  const context = {};
  const result = fn(event, context, callbackGuard);
  if (result instanceof Promise) {
    result
      .then((res) => callbackGuard(null, res))
      .catch((err) => callbackGuard(err));
  } else if (typeof result !== 'undefined') {
    callbackGuard(null, result);
  }
});

parentPort.postMessage('ready');

function loadFunction() {
  try {
    const resolved = require.resolve(functionPath);
    // always fresh
    delete require.cache[resolved];
    // eslint-disable-next-line import/no-dynamic-require
    const func = require(functionPath)[handlerFunction]; // eslint-disable-line global-require
    if (typeof func !== 'function') {
      throw new Error(
        `${functionPath} is not a function: ${typeof func}, ${func}`
      );
    }

    return func;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
