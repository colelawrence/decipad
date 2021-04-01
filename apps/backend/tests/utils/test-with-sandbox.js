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

    beforeAll(() => sandbox.start({ quiet: true }));
    afterAll(() => sandbox.end());
    afterAll(() => {
      process.chdir(beforeWorkingDir);
    });

    fn();
  });
}

module.exports = testWithSandbox;
