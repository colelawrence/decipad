const S3rver = require('s3rver');
const path = require('path');
const { nanoid } = require('nanoid');

let s3rver;

const port = Number((process.env.DECI_S3_ENDPOINT || 'localhost:4568').split(':')[1]);
if (!port) {
  throw new Error('no S3 server port defined');
}

let directory = '.s3rver_data';
const inTesting = !!process.env.JEST_WORKER_ID;
if (inTesting) {
  directory = path.join(directory, nanoid());
}

console.log('s3rver storing data in ' + directory);

const options = {
  port,
  directory,
  configureBuckets: [
    {
      name: 'pads',
    }
  ],
  silent: true,
  resetOnClose: true,
};

function package({ arc, cloudformation, stage='staging', inventory, createFunction }) {
  // no changes
  return cloudformation;
}

function start({ arc, inventory, invokeFunction, services }, callback) {
  s3rver = new S3rver(options);
  s3rver.run((err) => {
    setTimeout(() => {
      callback(err);
    }, 2000);
  });
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
