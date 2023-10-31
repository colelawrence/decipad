import { BrowserContext, Page, expect, test } from '@playwright/test';
import notebookSource from '../__fixtures__/005-magic-numbers.json';
import {
  editorTitleLocator,
  navigateToNotebook,
  setUp,
  waitForEditorToLoad,
  goToPlayground,
  keyPress,
  focusOnBody,
} from '../utils/page/Editor';
import { createWorkspace, importNotebook } from '../utils/src';
import {
  createCalculationBlockBelow,
  createCodeLineV2Below,
  createInputBelow,
} from '../utils/page/Block';

test.describe('Testing magic numbers', () => {
  test.describe.configure({ mode: 'serial' });

  let notebookId: string;
  let workspaceId: string;
  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    workspaceId = await createWorkspace(page);
    notebookId = await importNotebook(
      workspaceId,
      Buffer.from(JSON.stringify(notebookSource), 'utf-8').toString('base64'),
      page
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Waiting for editor to be ready', async () => {
    await navigateToNotebook(page, notebookId);
    await waitForEditorToLoad(page);
  });

  test('Checking if the "currently displayed elsewhere" text is shown', async () => {
    // Clicking Letter.Name
    await page.getByTestId('code-result:B').click();
    await page.getByTestId('unnamed-label').click();

    // Waiting for code line to load correctly
    await expect(page.getByTestId('code-line-result:B')).toBeVisible();

    await page.getByTestId('code-result:B').click();

    await expect(
      page.getByText(
        'This calculation is currently displayed elsewhere. Bring it back.'
      )
    ).toBeVisible();

    // Clicking lookup(Letters, Letter) twice to close the other menu and open the right one
    await page.getByTestId('code-result:B,2').click();
    await page.getByTestId('code-result:B,2').click();
    await expect(
      page.getByText(
        'This calculation is currently displayed elsewhere. Bring it back.'
      )
    ).toBeVisible();
  });

  test('Testing checkboxes', async () => {
    await page.getByTestId('code-result:false').click();
    await page.getByTestId('inline-formula-editor').click();
    await page
      .getByTestId('inline-formula-editor')
      .getByRole('textbox')
      .fill('true');
    await expect(page.getByTestId('code-result:true')).toBeVisible();
  });

  test('Testing unit change', async () => {
    await page.getByTestId('code-result:2042').click();
    await page
      .getByTestId('code-line-float')
      .getByTestId('unit-picker-button')
      .click();
    await page.getByText('Currency').click();
    await page.getByText('CAD').click();
    await expect(
      page.getByTestId('code-result:2042').getByText('$2,042')
    ).toBeVisible();
  });

  test('Testing changing variable name', async () => {
    await page.getByTestId('code-result:1234').click();
    await page.getByTestId('code-result:1234').click();
    await page
      .getByTestId('inline-formula-editor')
      .getByText('Advanced')
      .click();

    await page
      .getByTestId('inline-formula-editor')
      .getByText('Advanced')
      .fill('AdvancedChanged');

    // Unfocusing magic number menu
    await page.locator(editorTitleLocator()).click();

    await page.getByText('AdvancedChanged').click();
  });
});

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

test.describe('Inputs and magic numbers', () => {
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

  test('can create an input', async () => {
    await focusOnBody(page);
    await createInputBelow(page, 'Foo', 1337);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('1337')).toBeVisible();
  });

  test('can retrieve the value of an interactive input', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await page.keyboard.press('Enter');
    await expect(
      page.getByTestId('magic-number').getByText('1,337')
    ).toBeVisible();
  });

  test('it can render columns inline', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('What %[1,2,3,4,5]% .');
    await page.keyboard.press('Enter');
    await page.getByTestId('number-column-separator').last().waitFor();
    await page.getByTestId('number-column-ellipsis').last().waitFor();
  });
});
