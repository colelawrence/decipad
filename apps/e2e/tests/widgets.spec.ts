/* eslint-disable playwright/valid-describe-callback */
/* eslint-disable playwright/valid-title */
import { expect, test } from './manager/decipad-tests';
import {
  clickCell,
  createTable,
  downloadTableCSV,
  getFromTable,
  openColTypeMenu,
  writeInTable,
} from '../utils/page/Table';
import { createSliderBelow, createResultBelow } from '../utils/page/Block';

import { Timeouts } from '../utils/src';

test('toggle Widget', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('can create a toggle', async () => {
    await notebook.focusOnBody();
    await notebook.addToggleWidget('Input2');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('Input2')).toBeVisible();
    await expect(
      page.getByTestId('widget-editor').getByRole('checkbox')
    ).not.toBeChecked();
    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();
  });

  await test.step('can turn on toggle', async () => {
    const widgetEditor = page.getByTestId('widget-editor');
    await page.getByTestId('toggle-cell-editor').click();
    await expect(widgetEditor.getByRole('checkbox')).toBeChecked();
    await expect(page.getByText('true', { exact: true }).first()).toBeVisible();
  });

  await test.step('can turn off toggle', async () => {
    const widgetEditor = page.getByTestId('widget-editor');
    await page.getByTestId('toggle-cell-editor').click();
    await expect(widgetEditor.getByRole('checkbox')).not.toBeChecked();
    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();
  });
});

test('date widget + date widget read mode', async ({
  testUser,
  unregisteredUser,
}) => {
  let sharedPageLocation: string | null;

  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  await test.step('publish notebook with date widget', async () => {
    await testUser.notebook.addDatePickerWidget('Date');

    await testUser.page.getByTestId('widget-input').click();
    await testUser.page.getByText('Today').click();

    await expect(
      testUser.page.getByTestId('date-picker'),
      'data picker didnt close after selecting today'
    ).toBeHidden();
    await expect(
      testUser.page.getByTestId('widget-input'),
      'date widget doesnt display todays date after selecting today from the picker'
    ).toContainText(formattedDate);

    sharedPageLocation = await testUser.notebook.publishNotebook();
    expect(sharedPageLocation).toContain('Welcome-to-Decipad');
  });

  await test.step('[incognito] navigates to published notebook and updates date widget', async () => {
    await unregisteredUser.page.goto(sharedPageLocation!);
    await unregisteredUser.notebook.waitForEditorToLoad();
    await unregisteredUser.page.getByTestId('widget-input').click();
    await unregisteredUser.page.locator('text=Today').click();
    await expect(
      unregisteredUser.page.getByTestId('date-picker'),
      'data picker didnt close after selecting today'
    ).toBeHidden();
    await expect(
      unregisteredUser.page.getByTestId('widget-input'),
      'date widget doesnt display todays date after selecting today from the picker'
    ).toContainText(formattedDate);
  });
});

test('slider Widget', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await createSliderBelow(page, notebook, 'Input3', '$5 per hotdog');
  await page.getByRole('slider').click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('widget-input')).toContainText('$6 per hotdog');
});

test('dropdown widget', async ({ randomFreeUser }) => {
  const { page, notebook, workspace } = randomFreeUser;
  await test.step('creates an empty dropdown widget', async () => {
    await workspace.newWorkspaceWithPlan('plus');
    await workspace.createNewNotebook();
    await randomFreeUser.aiAssistant.closePanel();
    await notebook.waitForEditorToLoad();
    await randomFreeUser.notebook.closeSidebar();
    await notebook.focusOnBody();
    await notebook.addDropdownWidget('Dropdown');
    expect(await page.getByTestId('dropdown-widget').count()).toBe(1);
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
    const dropdownOptions = page.getByTestId('dropdown-option');
    // Dropdown should have hidden.
    expect(await dropdownOptions.count()).toBe(0);
  });

  await test.step('update first option', async () => {
    await page.getByText('50%').click();
    await page.getByTestId('dropdown-option').getByText('50%').hover();
    await page
      .getByRole('listbox')
      .getByRole('button', { name: 'Edit' })
      .click();
    await page.keyboard.press('ControlOrMeta+A');
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
      .getByRole('listbox')
      .getByRole('button', { name: 'Edit' })
      .click();
    await page.keyboard.press('ControlOrMeta+A');
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
      page.getByRole('menuitem').getByText('From Dropdown')
    ).toBeVisible();
  });

  await test.step('You can open dropdown in the cell', async () => {
    await page.getByRole('menuitem').getByText('From Dropdown').click();
    await page.getByRole('menuitem', { name: 'ListBulleted Dropdown' }).click();

    await expect(page.getByTestId('dropdown-editor')).toHaveCount(3);
    await clickCell(page, 1, 2);

    const dropdownOptions = page.getByTestId('dropdown-option');
    expect(await dropdownOptions.count()).toBe(2);
    await page.getByTestId('dropdown-option').getByText('50%').click();
    await expect(dropdownOptions).toBeHidden();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    expect(await getFromTable(page, 1, 2)).toBe('50%');
  });

  await test.step('Changing original dropdown value, also changes the cells value', async () => {
    await page.locator('[aria-roledescription="dropdown-open"]').click();

    await page.getByTestId('dropdown-option').getByText('50%').hover();

    await page
      .getByRole('listbox')
      .getByRole('button', { name: 'Edit' })
      .click();

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.insertText('0');
    await page.keyboard.press('Enter');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    expect(await getFromTable(page, 1, 2)).toBe('500%');
  });

  await test.step('Load Drop down with values from table column', async () => {
    await notebook.openSidebar();
    await page.getByTestId('sidebar-Format').click();
    await page.getByLabel('Dropdown type').click();
    await page.getByRole('menuitem', { name: 'From existing column' }).click();

    await writeInTable(page, 'One', 1, 0);
    await writeInTable(page, 'Two', 2, 0);
    await writeInTable(page, 'Three', 3, 0);

    await page.locator('[aria-roledescription="dropdown-open"]').click();

    await expect(async () => {
      expect(await notebook.getDropdownOptions()).toEqual([
        'Table.Column1',
        'Table.Column2',
        'Table.Column3',
      ]);
    }).toPass();

    await page.getByTestId('dropdown-option').nth(0).click();

    await page
      .getByTestId('dropdown-option')
      .nth(1)
      .waitFor({ state: 'visible', timeout: 5000 });

    await expect(async () => {
      const items = await Promise.all(
        (
          await page.getByTestId('dropdown-option').all()
        ).map((e) => e.innerText())
      );

      expect(items[1]).toBe('One');
      expect(items[2]).toBe('Two');
      expect(items[3]).toBe('Three');
    }).toPass();

    await page.getByTestId('dropdown-option').nth(1).click();

    await expect(page.getByTestId('dropdown-display')).toHaveText(/One/);
  });

  await test.step('Get CSV for table', async () => {
    const csvData = await downloadTableCSV(page, 'Table');
    expect(csvData).toBe(
      'Column1,Column2,Column3\n"One","","500%"\n"Two","",""\n"Three","",""'
    );
  });

  await test.step('Move dropdown into a new tab', async () => {
    await notebook.createTab('Another Tab');
    await notebook.selectTab('New Tab');
    await notebook.moveToTab(0, 'Another Tab');
    await notebook.selectTab('nother Tab');
    await expect(notebook.getDropdownLocator('Dropdown')).toBeVisible();
    await notebook.selectTab('New Tab');
    await expect(notebook.getDropdownLocator('Dropdown')).toBeHidden();
  });

  await test.step('check table dropdown is still linked to the dropdown that was moved', async () => {
    await expect(page.getByTestId('dropdown-editor')).toHaveCount(3);
    await clickCell(page, 2, 2);
    const dropdownOptions = page.getByTestId('dropdown-option');
    expect(
      await dropdownOptions.count(),
      "Dropdown on table isn't showing all options"
    ).toBe(2);
    await page.getByTestId('dropdown-option').getByText('75%').click();
    await expect(dropdownOptions).toBeHidden();
    expect(await getFromTable(page, 2, 2)).toBe('75%');
  });
});

test('result widget', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('creates an empty result widget', async () => {
    await createResultBelow(page);
    await expect(page.getByTestId('result-widget')).toHaveCount(1);
  });

  await test.step('shows the available calculations', async () => {
    await notebook.focusOnBody();
    await notebook.addAdvancedFormula('Hello = $5 + $1');
    await notebook.addAdvancedFormula('World = $5 + $3.33333');
    await notebook.addAdvancedFormula('Bye = $8');
    await expect(async () => {
      await notebook.resultWidget.click();
      await notebook.checkDropdownOptions(['Hello', 'World', 'Bye']);
    }).toPass();
  });

  await test.step('shows correct result of a variable', async () => {
    await notebook.selectDropdownOption('Bye');
    expect(await notebook.getResultWidgetValue('Bye')).toBe('$8');
  });

  await test.step('updates the result when calculation changes', async () => {
    await page.getByText('Bye = $8').click();
    await page.keyboard.press('End');
    await page.keyboard.type(' + 4');

    await expect(async () => {
      expect(await notebook.getResultWidgetValue('Bye')).toBe('$12');
    }).toPass();
  });

  await test.step('doesnt show tables nor formulas on widget dropdown', async () => {
    await notebook.addAdvancedFormula('table = { hello = [1, 2, 3] }');
    await notebook.addAdvancedFormula('f(x) = x + 10');

    await expect(async () => {
      await notebook.resultWidget.click();
      // make sure formulas and table names weren't added to result widget
      await notebook.checkDropdownOptions(['Hello', 'World', 'Bye']);
    }).toPass();
  });

  await test.step('check displayed option is selected', async () => {
    await notebook.checkDropdownOptionIsSelected('Bye');
  });
});

test('check editor doesnt crash widgets', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.focusOnBody();
  await notebook.selectLastParagraph();
  await notebook.addParagraph('Hello');
  await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText(
    'Hello'
  );
  await notebook.addSliderWidget();
  await page.getByTestId('paragraph-wrapper').nth(0).selectText();
  await page.keyboard.press('Home', { delay: 100 });
  await page.keyboard.press('Enter', { delay: 200 });
  await expect(page.getByTestId('paragraph-wrapper').nth(0)).toHaveText('');
  await expect(page.getByTestId('paragraph-wrapper').nth(1)).toHaveText(
    'Hello'
  );
  await notebook.checkCalculationErrors();
});
