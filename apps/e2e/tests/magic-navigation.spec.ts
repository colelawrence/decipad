import { Page, test } from '@playwright/test';
import {
  createCalculationBlockBelow,
  createCodeLineV2Below,
} from '../utils/page/Block';
import {
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Navigating with magic numbers', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await goToPlayground(page);
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('creates some text', async () => {
    await page.keyboard.type('Should you buy a house?');
    await keyPress(page, 'Enter');
    await page.keyboard.type('Price is %Price');
    await keyPress(page, '%');
    await keyPress(page, 'Enter');
    await createCalculationBlockBelow(page, 'Fees = 5 gbp');

    await page.waitForSelector('text=Should you buy a house?');
  });

  test('goes all the way down to australia', async () => {
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, 'Enter');
    await keyPress(page, '=');

    await createCodeLineV2Below(page, 'Price', 'Fees + 30 gbp');

    await page.waitForSelector('text=is £35');
    const magic = await page.locator('span[title="35"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await page.waitForSelector('span[title="35"] >> visible=false');
  });
});
