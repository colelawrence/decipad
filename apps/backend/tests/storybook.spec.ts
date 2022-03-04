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

  it('redirects /.storybook to the storybook index.html', async () => {
    const resp = await env.http.call('/.storybook', { redirect: 'manual' });
    expect(resp.status).toBe(301);
    expect(resp.headers.get('location')).toMatch(/\.storybook\/index\.html/);
  });
});
