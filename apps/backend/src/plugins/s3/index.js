const S3rver = require('s3rver');

let s3rver;
const options = {
  resetOnClose: true,
  directory: '.s3rver_data',
  configureBuckets: [
    {
      name: 'pads',
    }
  ],
  silent: true,
};

function package({ arc, cloudformation, stage='staging', inventory, createFunction }) {
  // no changes
  return cloudformation;
}

function start({ arc, inventory, invokeFunction, services }, callback) {
  s3rver = new S3rver(options);
  s3rver.run(callback);
}

function end({ arc, inventory, services }, callback) {
  if (!s3rver) {
    return callback();
  }
  s3rver.close(callback);
}

const sandbox = { start, end };

module.exports = {
  package,
  sandbox,
};
