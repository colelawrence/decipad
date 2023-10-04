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
    await page.getByTestId('paragraph-content').last().click();
    await page.keyboard.type('Price is %Price');
    await page.keyboard.press('%');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'Fees = 5£');
    await page.getByText('Should you buy a house?').waitFor();
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

    await createCodeLineV2Below(page, 'Price', 'Fees + 30£');
    await page.getByText('is £35').waitFor();
    const magic = page.locator('span[title="35"]');
    await magic.scrollIntoViewIfNeeded();
    await magic.click();
    await page.waitForSelector('span[title="35"] >> visible=false');
  });
});
