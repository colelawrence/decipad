import { setUp } from './page-utils/Home';

beforeAll(async () => {
  await setUp();
});

it('displays a welcome message', async () => {
  await page.$('text=/make better decisions/i');
});
