import { expect, Page, test } from '@playwright/test';
import {
  createToggleBelow,
  createDateBelow,
  createSliderBelow,
} from '../utils/page/Block';
import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from '../utils/page/Editor';

test.describe('Test Toggle Widget', () => {
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

  test('can create a toggle', async () => {
    await focusOnBody(page);
    await createToggleBelow(page, 'Input2');
    await keyPress(page, 'ArrowRight');
    await expect(page.locator('text=Input2')).toBeVisible();
    await expect(page.locator('text=Off')).toBeVisible();
  });

  test('can turn on toggle', async () => {
    await page.getByTestId('widget-editor').getByRole('button').nth(2).click();
    await expect(page.locator('text=On')).toBeVisible();
  });

  test('can turn off toggle', async () => {
    await page.getByTestId('widget-editor').getByRole('button').nth(2).click();
    await expect(page.locator('text=Off')).toBeVisible();
  });
});

test.describe('Tests Date Widget', () => {
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

  test('Test Date Widget', async () => {
    await keyPress(page, 'ArrowDown');
    await createDateBelow(page, 'Input3');

    await page.locator('[data-test-id="widget-input"]').click();
    await page.getByText('Today').click();

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    await expect(page.locator('[data-test-id="widget-input"]')).toContainText(
      formattedDate
    );
  });
});

test.describe('Tests Slider Widget', () => {
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

  test('Test Slider Widget', async () => {
    await keyPress(page, 'ArrowDown');
    await createSliderBelow(page, 'Input3', '$5 per hotdog');
    await page.getByRole('slider').click();
    await keyPress(page, 'ArrowRight');
    await expect(page.locator('[data-test-id="widget-input"]')).toContainText(
      '$6 per hotdog'
    );
  });
});
