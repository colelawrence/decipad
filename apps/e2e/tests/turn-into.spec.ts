import { expect, test } from './manager/decipad-tests';
import { Timeouts } from '../utils/src';

test('Turn Into', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await test.step('Converts between widgets with different elements and sizes', async () => {
    await page.keyboard.press('ArrowDown');
    await notebook.addInputWidget('Input', 'true');

    await expect(page.getByRole('slider')).toBeHidden();
    await expect(page.getByRole('checkbox')).toBeHidden();

    await page.getByTestId('drag-handle').first().click();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('slider').click();

    await expect(page.getByRole('slider')).toBeVisible();

    await page.getByTestId('drag-handle').first().click();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('toggle').click();

    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  await test.step('Converts a Widget into a structured input', async () => {
    await page.keyboard.press('ArrowDown');
    await notebook.addToggleWidget('Input2');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);

    await expect(
      page.getByText('false', { exact: true }).first()
    ).toBeVisible();

    await page.getByTestId('drag-handle').nth(1).click();
    await expect(page.getByText('turn into')).toBeVisible();
    await expect(page.getByText('Download chart')).toBeHidden();
    await page.getByRole('menuitem').getByText('turn into').hover();
    await page.getByRole('menuitem').getByText('calculation').click();

    await expect(page.getByTestId('codeline-varname').nth(-1)).toContainText(
      'Input2'
    );
    await expect(page.getByTestId('codeline-code').nth(-1)).toContainText(
      'false'
    );
  });
});

test('make sure the toggle conversion works', async ({ testUser }) => {
  const { page, notebook } = testUser;
  await notebook.addBlockSlashCommand('input');
  await page.locator('article').getByTestId('drag-handle').first().click();
  await page.getByText('Turn into').click();
  await page.getByRole('menuitem').getByText('Toggle').click();
  await expect(page.getByTestId('widget-editor:false')).toBeHidden();
});
