'use strict';

/* eslint-env jest */

import sandbox from '@architect/sandbox';
import path from 'path';
import rimraf from 'rimraf';
// import getPort from 'get-port';

function testWithSandbox(description, fn) {
  return describe(description, () => {
    let beforeWorkingDir;

    beforeAll(async () => {
      process.env.DECI_PORT = process.env.PORT = '3333';
      process.env.NEXTAUTH_URL = 'http://localhost:3333/api/auth';
      //   process.env.ARC_EVENTS_PORT = await getPort();
      //   process.env.ARC_TABLES_PORT = await getPort();
    });

    beforeAll(() => {
      beforeWorkingDir = process.cwd();
      process.chdir(path.join(__dirname, '..', '..'));
    });

    beforeAll((done) => {
      rimraf(path.join(process.cwd(), '.kafka_lite_data'), done);
    });

    beforeAll(async () => {
      await sandbox.start({
        quiet: true,
      });
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

    afterAll((done) => {
      setTimeout(done, 4000);
    });

    fn();
  });
}

export default testWithSandbox;
