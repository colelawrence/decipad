import { test } from './manager/decipad-tests';

/**
 * Example test file.
 *
 * This is a template for other E2E tests and serves as documentation
 * as to how we should be constructing the tests.
 *
 * 1. Parallel Tests.
 * Playwright will run all `test` calls in parallel and in new contexts (IE tabs).
 * Therefore, if you want to split tests up and have something after one after the other use.
 * test.step instead.
 */

// eslint-disable-next-line playwright/no-skipped-test
test.describe.skip('Testinggg', () => {
  test('does some stuff', async ({ testUser }) => {
    // Every test will need to grab its own copy.
    const { notebook } = testUser;

    await test.step('Like this you dont kill parallelism', async () => {
      await notebook.addAdvancedFormula('1+1');
    });
  });
});
