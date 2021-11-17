// playwright globals for browser tests
import 'jest-playwright-preset';

beforeEach(async () => {
  page.setDefaultTimeout(1_000);
});

afterEach(async () => {
  await jestPlaywright.resetPage();
});
