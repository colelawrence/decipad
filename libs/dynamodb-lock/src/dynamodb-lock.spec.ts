/* eslint-disable jest/no-done-callback */
/* eslint-disable no-use-before-define */
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { getDefined } from '@decipad/utils';
import { concurrentWrites } from './utils/concurrent-writes';

test('dynamodb lock', (ctx) => {
  const { test: it } = ctx;
  it('works for an unexisting record', async () => {
    const reader = await concurrentWrites(3);
    const latest = getDefined(
      await reader.read(),
      'expected latest document to exist'
    );
    // eslint-disable-next-line no-underscore-dangle
    expect(latest._version).toBe(3);
    expect(latest.seq).toMatchObject([0, 1, 2]);
  });
});
