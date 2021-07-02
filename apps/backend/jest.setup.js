require('isomorphic-fetch');
const rimraf = require('rimraf');
const path = require('path');

rimraf.sync(path.join(__dirname, '.kafka_lite_data'));
rimraf.sync(path.join(__dirname, '.s3rver_data'));


