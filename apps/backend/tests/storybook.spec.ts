/* eslint-env jest */

import fs from 'fs';
import path from 'path';
import { sync as mkdirp } from 'mkdirp';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';

test('the storybook handler', (env) => {
  const { test: it } = env;
  beforeAll(() => {
    const storyBookEntryFolder = path.join(
      __dirname,
      '..',
      'public',
      '.storybook'
    );
    const storyBookEntryFilePath = path.join(
      storyBookEntryFolder,
      'index.html'
    );
    if (!fs.existsSync(storyBookEntryFilePath)) {
      mkdirp(storyBookEntryFolder);
      fs.writeFileSync(storyBookEntryFilePath, 'hello');
    }
  });

  it.each(['/.storybook/', '/.storybook'])(
    'redirects %s to the storybook index.html',
    async (pathname) => {
      const resp = await env.http.call(pathname);
      expect(resp.redirected).toBe(true);
      expect(new URL(resp.url).pathname).toBe('/.storybook/index.html');
    }
  );
});
