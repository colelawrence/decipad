import waitForExpect from 'wait-for-expect';
import { setUp } from './page-utils/Home';
import { withNewUser } from './utils/with-new-user';

beforeAll(async () => {
  await setUp();
});

test('Should display welcome message', async () => {
  await waitForExpect(async () =>
    expect(await page.isVisible('text=/make/i')).toBe(true)
  );
});

test('should redirect to workspace if authenticated', async () => {
  await withNewUser();
  await page.goto('/');
  await waitForExpect(async () =>
    expect(await page.isVisible('text=/Workspace/i')).toBe(true)
  );
});
