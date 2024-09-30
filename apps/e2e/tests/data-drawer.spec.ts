import { expect, test } from './manager/decipad-tests';
import type { Page } from './manager/decipad-tests';
import { snapshot } from '../utils/src';
import notebookSource from '../__fixtures__/005-magic-numbers.json';

test('basic data drawer', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await page.keyboard.type('this is a number =');
  await expect(page.getByText('Edit Data')).toBeVisible();

  await page.keyboard.type('500+1');
  await expect(page.getByTestId('data-drawer-result:501')).toBeVisible();
  await expect(page.getByTestId('number-result:501')).toBeVisible();
  await page.getByRole('img', { name: 'Close' }).click();
  await expect(page.getByText('Edit Data')).toBeHidden();
});

test('basic functions helper', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await notebook.focusOnBody();
  await page.keyboard.type('this is a number =');
  await expect(page.getByText('Edit Data')).toBeVisible();
  await page.getByTestId('toggle-cell-editor').click();
  await expect(page.getByText('abs()')).toBeVisible();
  await expect(page.getByText('factorial()')).toBeVisible();
  await snapshot(testUser.page as Page, 'Notebook: Functions Helper');
});
test('basic inline results', async ({ testUser }) => {
  const { page } = testUser;
  await testUser.importNotebook(notebookSource);
  await testUser.notebook.waitForEditorToLoad();

  await test.step('Opens the data drawer.', async () => {
    // Clicking Letter.Name
    await page.getByTestId('code-result:B').click();

    await expect(testUser.notebook.dataDrawer).toBeVisible();
    await expect(page.getByTestId('data-drawer-result:B')).toBeVisible();
  });

  await test.step('Testing checkboxes', async () => {
    await page.getByTestId('code-result:false').click();
    await expect(testUser.notebook.dataDrawer).toBeVisible();

    await testUser.notebook.dataDrawer.fill('true');
    await expect(page.getByTestId('code-result:true')).toBeVisible();
  });

  await test.step('Testing unit change', async () => {
    await page.keyboard.press('Escape');
    await page
      .getByTestId('number-result:34 minutes 2 seconds')
      .first()
      .click();

    await testUser.notebook.dataDrawer.fill('2042');
    await testUser.notebook.dataDrawerUnitPicker.click();

    await page.getByText('Currency').click();
    await page.getByText('CAD').click();

    await expect(
      testUser.notebook.dataDrawerWrapper.getByText('$2,042')
    ).toBeVisible();
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
      page.getByTestId('editor-sidebar').getByText('Slider').nth(1)
    ).toBeVisible();

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Backspace');
    }
    await page.getByTestId('sidebar-Data').click();

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
    page.getByTestId('editor-sidebar').getByTestId('number-result:1,234')
  ).toBeHidden();
});

test('number inputs and inline reslults', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('can create an input', async () => {
    await testUser.notebook.openSidebar();
    await page.getByTestId('sidebar-Data').click();

    await notebook.focusOnBody();
    await notebook.addInputWidget('Foo', 1337);
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('1337')).toBeVisible();
  });

  await test.step('can retrieve the value of an interactive input', async () => {
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');

    await page.keyboard.type('That foo is ');
    await page.getByTestId('sidebar-Data').click();
    await testUser.notebook.dragMagicNumber('Foo');

    await expect(
      page.getByTestId('magic-number').getByText('1,337')
    ).toBeVisible();
  });

  await test.step('move widget to another tab and check inline number still works', async () => {
    await notebook.createTab('Another Tab');
    await notebook.selectTab('New Tab');
    await notebook.moveToTab(0, 'Another Tab');
    // adding some action so the computer has time to update after the move
    await notebook.focusOnBody();
    await notebook.updateNotebookTitle('Checking tabs');
    await expect(
      page.getByTestId('magic-number').getByText('1,337'),
      "inline number dosn't work when variable is moved to another tab"
    ).toBeVisible();
  });
});
