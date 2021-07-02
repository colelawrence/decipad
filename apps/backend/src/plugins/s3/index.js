const S3rver = require('s3rver');
const path = require('path');
const { nanoid } = require('nanoid');

let s3rver;

const port = Number((process.env.DECI_S3_ENDPOINT || 'localhost:4568').split(':')[1]);
if (!port) {
  throw new Error('no S3 server port defined');
}

let directory = `/tmp/${nanoid()}`;

console.log('s3rver storing data in ' + directory);

const options = {
  port,
  directory,
  configureBuckets: [
    {
      name: 'pads',
    }
  ],
  silent: process.env.NODE_ENV === 'production',
};

function package({ arc, cloudformation, stage='staging', inventory, createFunction }) {
  // no changes
  return cloudformation;
}

function start({ arc, inventory, invokeFunction, services }, callback) {
  s3rver = new S3rver(options);
  s3rver.run()
    .then(() => callback())
    .catch(callback);
}

function end({ arc, inventory, services }, callback) {
  if (!s3rver) {
    return callback();
  }
  s3rver.close(callback);
  s3rver = undefined;
}

const sandbox = { start, end };

module.exports = {
  package,
  sandbox,
};
