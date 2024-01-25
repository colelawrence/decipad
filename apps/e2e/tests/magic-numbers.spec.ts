import { expect, test } from './manager/decipad-tests';
import notebookSource from '../__fixtures__/005-magic-numbers.json';
import {
  editorTitleLocator,
  keyPress,
  focusOnBody,
} from '../utils/page/Editor';
import {
  createCalculationBlockBelow,
  createCodeLineV2Below,
  createInputBelow,
} from '../utils/page/Block';

test('Testing magic numbers', async ({ testUser }) => {
  const { page } = testUser;
  await testUser.importNotebook(notebookSource);

  await test.step('Checking if the "currently displayed elsewhere" text is shown', async () => {
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

  await test.step('Testing checkboxes', async () => {
    await page.getByTestId('code-result:false').click();
    await page.getByTestId('inline-formula-editor').click();
    await page
      .getByTestId('inline-formula-editor')
      .getByRole('textbox')
      .fill('true');
    await expect(page.getByTestId('code-result:true')).toBeVisible();
  });

  await test.step('Testing unit change', async () => {
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

  await test.step('Testing changing variable name', async () => {
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

  await test.step('block and variable search in sidebar', async () => {
    await testUser.notebook.openSidebar();
    await expect(
      page.getByTestId('editor-sidebar').getByText('Number Input').first()
    ).toBeVisible();
    await expect(
      page.getByTestId('editor-sidebar').getByText('Slider').nth(2)
    ).toBeVisible();

    await page.getByTestId('sidebar-Insert').click();
    await page.keyboard.press('Tab');
    await page.keyboard.type('Slider');

    await expect(
      page.getByTestId('editor-sidebar').getByText('Number Input')
    ).toBeHidden();
    await expect(
      page.getByTestId('editor-sidebar').getByText('Slider').nth(2)
    ).toBeVisible();

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Backspace');
    }
    await page.getByTestId('sidebar-Data').click();
    await expect(
      page.getByTestId('editor-sidebar').getByText('AdvancedChanged')
    ).toBeVisible();
    await expect(
      page.getByTestId('editor-sidebar').getByTestId('number-result:1,234')
    ).toBeVisible();
  });

  await page.keyboard.press('Tab');
  await page.keyboard.type('Formula');

  await expect(
    page.getByTestId('editor-sidebar').getByText('Formula')
  ).toBeVisible();

  await expect(
    page.getByTestId('editor-sidebar').getByTestId('number-result:50')
  ).toBeVisible();
  await expect(
    page.getByTestId('editor-sidebar').getByText('AdvancedChanged')
  ).toBeHidden();
  await expect(
    page.getByTestId('editor-sidebar').getByTestId('number-result:1,234')
  ).toBeHidden();
});

test('Navigating with magic numbers', async ({ testUser }) => {
  const { page, notebook } = testUser;
  const notebookTitke = 'Should you buy a house?';

  await test.step('Set editor title', async () => {
    await notebook.updateNotebookTitle(notebookTitke);
    await notebook.checkNotebookTitle(notebookTitke);
  });

  await test.step('creates some text', async () => {
    await page.getByTestId('paragraph-content').last().click();
    await page.keyboard.type('Price is %Price');
    await page.keyboard.press('%');
    await page.keyboard.press('Enter');
    await createCalculationBlockBelow(page, 'Fees = 5£');
    await page.getByText(notebookTitke).waitFor();
  });

  await test.step('goes all the way down to australia', async () => {
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
    // eslint-disable-next-line playwright/no-wait-for-selector
    await page.waitForSelector('span[title="35"] >> visible=false');
  });
});

test('Inputs and magic numbers', async ({ testUser }) => {
  const { page } = testUser;
  await test.step('can create an input', async () => {
    await focusOnBody(page);
    await createInputBelow(page, 'Foo', 1337);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('1337')).toBeVisible();
  });

  await test.step('can retrieve the value of an interactive input', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await page.keyboard.press('Enter');
    await expect(
      page.getByTestId('magic-number').getByText('1,337')
    ).toBeVisible();
  });

  await test.step('it can render columns inline', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('What %[1,2,3,4,5]% .');
    await page.keyboard.press('Enter');
    await page.getByTestId('number-column-separator').last().waitFor();
    await page.getByTestId('number-column-ellipsis').last().waitFor();
  });
});
