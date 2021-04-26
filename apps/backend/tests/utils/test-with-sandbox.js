'use strict';

/* eslint-env jest */

const sandbox = require('@architect/sandbox');
const path = require('path');
const rimraf = require('rimraf');

function testWithSandbox(description, fn) {
  return describe(description, () => {
    let beforeWorkingDir;
    beforeAll(() => {
      beforeWorkingDir = process.cwd();
      process.chdir(path.join(__dirname, '..', '..'));
    });
    beforeAll((done) => {
      rimraf(path.join(process.cwd(), '.kafka_lite_data'), done);
    });

    beforeAll(async () => {
      await sandbox.start({ quiet: true });
    });

    afterAll(async () => {
      await sandbox.end();
    });

    beforeAll((done) => {
      setTimeout(done, 2000);
    });

    afterAll(() => {
      process.chdir(beforeWorkingDir);
    });

    fn();
  });
}

module.exports = testWithSandbox;
