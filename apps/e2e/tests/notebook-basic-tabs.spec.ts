// <reference lib="dom"/>
import { BrowserContext, Page, test, expect } from '@playwright/test';
import { setUp, focusOnBody, ControlPlus } from '../utils/page/Editor';
import { createWorkspace } from '../utils/src';

test.describe('check basic tabs funcionality @notebook @tabs', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );

    await createWorkspace(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('check new notebook first tab', async () => {
    await focusOnBody(page);
    await page.keyboard.type('this is the first paragraph on the first tab');
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the first paragraph on the first tab'
    );
    await expect(page.getByTestId('tab-name')).toHaveText('New Tab');
  });

  test('rename first tab', async () => {
    await page.getByTestId('tab-options-button').click();
    await expect(page.getByTestId('tab-options-menu')).toBeVisible();
    await page.getByTestId('tab-options-menu').getByText('Rename Tab').click();
    ControlPlus(page, 'a');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('First Tab');
    await page.keyboard.press('Enter');
  });

  test('add second tab', async () => {
    await page.getByTestId('add-tab-button').click();
    await page.keyboard.press('Enter');
    await expect(await page.getByTestId('tab-button').count()).toBe(2);
  });

  test('check second tab does not have text and adds new paragraph', async () => {
    await focusOnBody(page);
    await expect(page.getByTestId('paragraph-content')).toHaveText('');
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).not.toHaveText(
      'this is the first paragraph on the first tab'
    );
    await page.keyboard.type('this is the first paragraph on the second tab');
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the first paragraph on the second tab'
    );
  });

  test('check first tab still has original text', async () => {
    await page.getByTestId('tab-button').first().click();
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the first paragraph on the first tab'
    );
  });

  test('delete second tab', async () => {
    // goes to second tab named New Tab
    await page.getByTestId('tab-button').getByText('New Tab').click();
    await page.getByTestId('tab-options-button').nth(1).click();
    await expect(page.getByTestId('tab-options-menu')).toBeVisible();
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the first paragraph on the second tab'
    );
    await page.getByTestId('tab-options-menu').getByText('Delete').click();
    // check it goes to first tab after delition second tab
    await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
      'this is the first paragraph on the first tab'
    );
    await expect(await page.getByTestId('tab-button').count()).toBe(1);
  });
});
