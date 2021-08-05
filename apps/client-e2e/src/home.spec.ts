import { setUp } from './page-utils/Home';

beforeAll(setUp);

it('displays a welcome message', async () => {
  expect(
    await (await page.$('text=/make better decisions/i'))!.isVisible()
  ).toBe(true);
});
