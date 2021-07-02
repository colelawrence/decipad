/* eslint-env jest */

import path from 'path';
import sandbox from './sandbox';
import { timeout } from './timeout';

function testWithSandbox(description: string, fn: () => void) {
  return describe(description, () => {
    let beforeWorkingDir: string;

    beforeAll(() => {
      beforeWorkingDir = process.cwd();
      process.chdir(path.join(__dirname, '..', '..'));
    });

    beforeAll(async () => {
      await sandbox.start();
      await timeout(2000);
    }, 20000);

    afterAll(async () => {
      await sandbox.stop(undefined);
      await timeout(2000);
    });

    afterAll(() => {
      process.chdir(beforeWorkingDir);
    });

    fn();
  });
}

export default testWithSandbox;
