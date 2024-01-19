import { expect, test, Page, BrowserContext } from './manager/decipad-tests';
import {
  clickCell,
  createTable,
  downloadTableCSV,
  getFromTable,
  openColTypeMenu,
  writeInTable,
} from '../utils/page/Table';
import {
  createDropdownBelow,
  createToggleBelow,
  createDateBelow,
  createSliderBelow,
  createCalculationBlockBelow,
  createResultBelow,
} from '../utils/page/Block';

import {
  setUp,
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
  waitForNotebookToLoad,
  ControlPlus,
} from '../utils/page/Editor';

import { Timeouts } from '../utils/src';

test.describe('toggle Widget', () => {
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
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('Input2')).toBeVisible();
    await expect(
      page.getByTestId('widget-editor').getByRole('checkbox')
    ).not.toBeChecked();
    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();
  });

  test('can turn on toggle', async () => {
    const widgetEditor = page.getByTestId('widget-editor');
    await page.getByTestId('toggle-cell-editor').click();
    await expect(widgetEditor.getByRole('checkbox')).toBeChecked();
    await expect(page.getByText('true', { exact: true }).first()).toBeVisible();
  });

  test('can turn off toggle', async () => {
    const widgetEditor = page.getByTestId('widget-editor');
    await page.getByTestId('toggle-cell-editor').click();
    await expect(widgetEditor.getByRole('checkbox')).not.toBeChecked();
    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();
  });
});

test.describe('Date Widget', () => {
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

  test('Date Widget', async () => {
    await keyPress(page, 'ArrowDown');
    await createDateBelow(page, 'Input3');

    await page.getByTestId('widget-input').click();
    await page.getByText('Today').click();

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    await expect(page.getByTestId('widget-input')).toContainText(formattedDate);
  });
});

test.describe('date widget read mode', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPageLocation: string | null;
  let page: Page;
  let context: BrowserContext;
  let incognito: BrowserContext;
  let incognitoPage: Page;
  let formattedDate: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp({ page, context });
    await waitForEditorToLoad(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('adds date widget', async () => {
    await createDateBelow(page, 'Input3');

    await page.getByTestId('widget-input').click();
    await page.getByText('Today').click();

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;

    await expect(page.getByTestId('widget-input')).toContainText(formattedDate);
  });

  test('publish notebook', async () => {
    await page.getByTestId('publish-button').click();
    await page.getByTestId('publish-tab').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await page.locator('[aria-roledescription="enable publishing"]').click();
    await page.getByTestId('copy-published-link').click();
    sharedPageLocation = (
      (await page.evaluate('navigator.clipboard.readText()')) as string
    ).toString();
    expect(sharedPageLocation).toContain('Welcome-to-Decipad');
  });

  test('[incognito] navigates to published notebook and updates date widget', async ({
    browser,
  }) => {
    incognito = await browser.newContext();
    incognitoPage = await incognito.newPage();
    await incognitoPage.goto(sharedPageLocation!);
    await waitForNotebookToLoad(incognitoPage);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.chartsDelay);
    await incognitoPage.getByTestId('widget-input').click();
    await incognitoPage.locator('text=Today').click();
    await expect(incognitoPage.getByTestId('widget-input')).toContainText(
      formattedDate
    );
  });
});

test.describe('slider Widget', () => {
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

  test('Slider Widget', async () => {
    await keyPress(page, 'ArrowDown');
    await createSliderBelow(page, 'Input3', '$5 per hotdog');
    await page.getByRole('slider').click();
    await keyPress(page, 'ArrowRight');
    await expect(page.getByTestId('widget-input')).toContainText(
      '$6 per hotdog'
    );
  });
});

test('dropdown widget', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('creates an empty dropdown widget', async () => {
    await createDropdownBelow(page, 'Dropdown');
    expect(await page.getByText('Dropdown').count()).toBe(1);
  });

  await test.step('Open dropdown and view box to add option', async () => {
    await page.getByText('Select').click();
    await expect(async () => {
      await expect(page.getByPlaceholder('Type here')).toBeVisible();
    }).toPass();
  });

  await test.step('New option gets added to list', async () => {
    // Input box should be focused, so we can just start typing
    await page.keyboard.type('50%');
    await page.keyboard.press('Enter');
    expect(await notebook.getDropdownOptions()).toEqual(['50%']);
  });

  await test.step('Add another option to dropdown', async () => {
    const addNew = page.getByText('Add new');
    await addNew.click();

    // Dropdown should autofocus on input
    await page.keyboard.type('75%');
    await page.keyboard.press('Enter');
    expect(await notebook.getDropdownOptions()).toEqual(['50%', '75%']);
  });

  await test.step('Select option', async () => {
    await page.getByText('50%').click();
    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    // Dropdown should have hidden.
    expect(await dropdownOptions.count()).toBe(0);
  });

  await test.step('update first option', async () => {
    await page.getByText('50%').click();
    await page.getByTestId('dropdown-option').getByText('50%').hover();
    await page
      .getByRole('dialog')
      .getByRole('complementary')
      .locator('div')
      .filter({ hasText: 'Edit' })
      .click();
    await ControlPlus(page, 'A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('55%');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('dropdown-display')).toHaveText(/55%/);
    expect(await notebook.getDropdownOptions()).toEqual(['55%', '75%']);
  });

  await test.step('refresh notebook and see it still can edit', async () => {
    await page.reload();
    await page.getByText('55%').click();
    await page.getByTestId('dropdown-option').getByText('55%').hover();
    await page
      .getByRole('dialog')
      .getByRole('complementary')
      .locator('div')
      .filter({ hasText: 'Edit' })
      .click();
    await ControlPlus(page, 'A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('50%');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('dropdown-display')).toHaveText(/50%/);
    expect(await notebook.getDropdownOptions()).toEqual(['50%', '75%']);
  });

  await test.step('Dropdown option should appear in table column menu', async () => {
    await createTable(page);
    await openColTypeMenu(page, 2);
    await expect(
      page.getByRole('menuitem').getByText('Categories')
    ).toBeVisible();
  });

  await test.step('You can open dropdown in the cell', async () => {
    await page.getByRole('menuitem').getByText('Categories').click();
    await page.getByRole('menuitem').getByText('Dropdown').click();

    await expect(page.getByTestId('dropdown-editor')).toHaveCount(3);
    await clickCell(page, 1, 2);

    const dropdownOptions = page.locator(
      '[aria-roledescription="dropdownOption"]'
    );
    expect(await dropdownOptions.count()).toBe(2);
    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('50%')
      .click();
    await expect(dropdownOptions).toBeHidden();
    expect(await getFromTable(page, 1, 2)).toBe('50%');
  });

  await test.step('Changing original dropdown value, also changes the cells value', async () => {
    await page.locator('[aria-roledescription="dropdown-open"]').click();

    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('50%')
      .hover();

    await page
      .getByRole('complementary')
      .locator('div')
      .filter({ hasText: 'Edit' })
      .click();

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.insertText('0');
    await page.keyboard.press('Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    expect(await getFromTable(page, 1, 2)).toBe('500%');
  });

  await test.step('Load Drop down with values from table column', async () => {
    await page.locator('[data-testid="widget-editor"] button >> nth=1').click();
    await page.getByRole('menuitem', { name: 'Change type' }).click();
    await page.getByRole('menuitem', { name: 'From existing column' }).click();

    await writeInTable(page, 'One', 1, 0);
    await writeInTable(page, 'Two', 2, 0);
    await writeInTable(page, 'Three', 3, 0);

    await page.locator('[aria-roledescription="dropdown-open"]').click();

    const [option1, option2, option3] = await Promise.all([
      page
        .locator('[aria-roledescription="dropdownOption"] >> nth=0')
        .innerText(),
      page
        .locator('[aria-roledescription="dropdownOption"] >> nth=1')
        .innerText(),
      page
        .locator('[aria-roledescription="dropdownOption"] >> nth=2')
        .innerText(),
    ]);
    expect(option1).toBe('Table.Column1');
    expect(option2).toBe('Table.Column2');
    expect(option3).toBe('Table.Column3');

    await page
      .locator('[aria-roledescription="dropdownOption"] >> nth=0')
      .click();

    await page
      .locator('[aria-roledescription="dropdownOption"] >> nth=1')
      .waitFor({ state: 'visible', timeout: 5000 });

    await expect(async () => {
      const items = await Promise.all(
        (
          await page.locator('[aria-roledescription="dropdownOption"]').all()
        ).map((e) => e.innerText())
      );

      expect(items[1]).toBe('One');
      expect(items[2]).toBe('Two');
      expect(items[3]).toBe('Three');
    }).toPass();

    await page
      .locator('[aria-roledescription="dropdownOption"] >> nth=1')
      .click();

    const dropDownText = await page
      .locator('[aria-roledescription="dropdown-open"]')
      .innerText();

    expect(dropDownText).toBe('One');
  });

  await test.step('Get CSV for table', async () => {
    const csvData = await downloadTableCSV(page, 'Table');
    expect(csvData).toBe(
      'Column1,Column2,Column3\n"One","","500%"\n"Two","",""\n"Three","",""'
    );
  });
});

test.describe('result widget', () => {
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

  test('creates an empty result widget', async () => {
    await createResultBelow(page);
    await expect(page.getByText('Result')).toHaveCount(1);
  });

  test('shows the available calculations', async () => {
    await focusOnBody(page);
    await createCalculationBlockBelow(page, 'Hello = 5 + 1');
    await createCalculationBlockBelow(page, 'World = 5 + 3');

    await page.getByTestId('result-widget').click();

    await expect(
      page.locator('[aria-roledescription="dropdownOption"]').getByText('Hello')
    ).toBeVisible();
    await expect(
      page.locator('[aria-roledescription="dropdownOption"]').getByText('World')
    ).toBeVisible();
  });

  test('shows the result of a calculation', async () => {
    await page
      .locator('[aria-roledescription="dropdownOption"]')
      .getByText('Hello')
      .click();

    await expect(
      page.getByTestId('result-widget').getByText('6')
    ).toBeVisible();
  });

  test('updates the result when calculation changes', async () => {
    await page.getByText('Hello = 5 + 1').click();
    await ControlPlus(page, 'a');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type(' + 4');

    await expect(
      page.getByTestId('result-widget').getByText('10')
    ).toBeVisible();
  });

  test('doesnt show tables nor formulas on widget dropdown', async () => {
    await createCalculationBlockBelow(page, 'table = { hello = [1, 2, 3] }');
    await createCalculationBlockBelow(page, 'f(x) = x + 10');

    await page.getByTestId('result-widget').click();
    // only one different variable available
    await expect(
      page.locator('[aria-roledescription="dropdownOption"]')
    ).toHaveCount(2);
  });
});
