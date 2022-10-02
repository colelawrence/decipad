// playwright globals for browser tests
import fetch from 'isomorphic-fetch';
import 'jest-playwright-preset';
import waitForExpect from 'wait-for-expect';
import { baseUrl } from '../../testConfig';

waitForExpect.defaults.interval = 250;
waitForExpect.defaults.timeout = 10000;

beforeAll(async () => {
  const tryFetch = async () => {
    const result = await fetch(baseUrl);
    expect(result).toMatchObject({ status: 200 });
    expect(result.text()).not.toContain('Error');
  };

  await waitForExpect(
    async () => {
      await tryFetch();
      await page.waitForTimeout(2000);
      // try again, just to make sure
      await tryFetch();
    },
    50000,
    500
  );
}, 60000);
