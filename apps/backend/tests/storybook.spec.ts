/* eslint-env jest */

import baseUrl from './utils/base-url';
import test from './utils/test-with-sandbox';

test('the storybook handler', () => {
  it.each(['/.storybook/', '/.storybook'])(
    'redirects %s to the storybook index.html',
    async (path) => {
      const resp = await fetch(new URL(path, baseUrl()).href);
      expect(resp.redirected).toBe(true);
      expect(new URL(resp.url).pathname).toBe('/.storybook/index.html');
    }
  );
});
