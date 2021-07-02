/* eslint-env jest */

import sandbox from './sandbox';
import { timeout } from './timeout';

function testWithSandbox(description: string, fn: () => void) {
  return describe(description, () => {
    beforeAll(async () => {
      await sandbox.start();
      await timeout(4000);
    }, 20000);

    afterAll(async () => {
      await sandbox.stop(undefined);
      await timeout(4000);
    });

    fn();
  });
}

export default testWithSandbox;
