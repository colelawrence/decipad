'use strict';

/* eslint-env jest */

import path from 'path';
import rimraf from 'rimraf';
import sandbox from './sandbox';
// import getPort from 'get-port';
import dotenv from 'dotenv';

function testWithSandbox(description, fn) {
  return describe(description, () => {
    let beforeWorkingDir;

    beforeAll(() => {
      beforeWorkingDir = process.cwd();
      process.chdir(path.join(__dirname, '..', '..'));
    });

    beforeAll(() => {
      dotenv.config();
      process.env.DECI_PORT = process.env.PORT = '3333';
      process.env.NEXTAUTH_URL = 'http://localhost:3333/api/auth';

      //   process.env.ARC_EVENTS_PORT = await getPort();
      //   process.env.ARC_TABLES_PORT = await getPort();
    });

    beforeAll((done) => {
      rimraf(path.join(process.cwd(), '.kafka_lite_data'), done);
    });

    beforeAll(async () => {
      await sandbox.start();
    });

    afterAll(async () => {
      await sandbox.stop();
    });

    afterAll(() => {
      process.chdir(beforeWorkingDir);
    });

    fn();
  });
}

export default testWithSandbox;
