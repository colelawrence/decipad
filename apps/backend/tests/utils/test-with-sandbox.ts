/* eslint-env jest */

import sandbox from './sandbox';
import { timeout } from './timeout';

function testWithSandbox(description: string, fn: () => void) {
  return describe(description, () => {
    beforeAll(async () => {
      await sandbox.start();
    }, 20000);

    afterAll(async () => {
      await sandbox.stop();
      await timeout(4000);
    });

    fn();
  });
}

export default testWithSandbox;
