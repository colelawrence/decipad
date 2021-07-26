const rimraf = require('rimraf');
const path = require('path');
require('isomorphic-fetch');
const WebSocket = require('ws');

global.WebSocket = WebSocket;

process.chdir(__dirname);

rimraf.sync(path.join(__dirname, '.kafka_lite_data'));
rimraf.sync(path.join(__dirname, '.s3rver_data'));

// Sets default timeout for all tests to 10000.
// This should be enough time for some requests
// that require a lambda cold start.
jest.setTimeout(10000);
