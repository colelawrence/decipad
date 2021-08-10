// playwright globals for browser tests
import fetch from 'isomorphic-fetch';
import 'jest-playwright-preset';
import waitForExpect from 'wait-for-expect';
import { baseUrl } from '../../testConfig';

beforeAll(async () => {
  await waitForExpect(
    async () => {
      expect(await fetch(baseUrl)).toMatchObject({ status: 200 });
    },
    50000,
    500
  );
}, 60000);
