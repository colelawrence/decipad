import {
  createWithSlashCommand,
  focusTrailingParagraph,
} from '../utils/page/Block';
import { expect, test } from './manager/decipad-tests';

test('Formatting tab', async ({ testUser }) => {
  const { page, notebook } = testUser;

  await test.step('create blocks and open formatting tab', async () => {
    await createWithSlashCommand(page, '/input', 'input'); // 0
    await createWithSlashCommand(page, '/slider'); // 1
    await createWithSlashCommand(page, '/slider'); // 2
    await createWithSlashCommand(page, '/dropdown'); // 3
    await createWithSlashCommand(page, '/result'); // 4

    await notebook.openSidebar();
    await page.getByTestId('sidebar-Format').click();
  });

  await test.step('rename input widget', async () => {
    await notebook.selectBlocks(0, 0);
    await page.getByLabel('Variable name').fill('Renamed Input');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('input-widget-name').nth(0)).toContainText(
      'RenamedInput'
    );
  });

  await test.step('turn input into slider', async () => {
    await page.getByLabel('Visualization').click();
    await page.getByRole('menuitem', { name: 'Slider widget' }).click();
    await expect(page.getByLabel('Minimum value')).toBeVisible();
  });

  await test.step('select all three sliders', async () => {
    await notebook.selectBlocks(0, 2);
    await expect(page.getByLabel('Variable name')).toBeDisabled();
    await expect(page.getByLabel('Variable name')).toHaveAttribute(
      'placeholder',
      'Multiple'
    );
    await expect(page.getByLabel('Minimum value')).toBeVisible();
  });

  await test.step('change minimum value of all sliders at once', async () => {
    await page.getByLabel('Minimum value').fill('3');

    for (let i = 0; i <= 2; i++) {
      await notebook.selectBlocks(i, i);
      await expect(page.getByLabel('Minimum value')).toHaveValue('3');
    }
  });

  await test.step('select widgets of mixed variants', async () => {
    await notebook.selectBlocks(2, 3);
    await expect(page.getByLabel('Variable name')).toBeVisible();
    await expect(page.getByLabel('Variable color')).toBeVisible();
    await expect(page.getByLabel('Minimum value')).toBeHidden();
  });

  /**
   * Currently, no form covers both result widgets and variable definition
   * widgets. If such a form is added, this test will need to be chagned to
   * select two blocks that both have formatting controls when selected
   * individually, but have no controls in common with each other. If
   * formatting controls for charts have been implemented by the time this
   * happens, charts and widgets may be a good candidate.
   */
  await test.step('select blocks of mixed types', async () => {
    await notebook.selectBlocks(3, 4);
    await expect(page.getByLabel('Notebook title')).toBeVisible();
    await expect(page.getByLabel('Variable name')).toBeHidden();
  });

  await test.step('select paragraph', async () => {
    await focusTrailingParagraph(page);
    await notebook.updateNotebookTitle('One');
    await expect(page.getByLabel('Notebook title')).toHaveValue('One');
    await notebook.updateNotebookTitle('Two');
    await expect(page.getByLabel('Notebook title')).toHaveValue('Two');
    await page.getByLabel('Notebook title').fill('Three');
    await page.keyboard.press('Enter');
    await notebook.checkNotebookTitle('Three');
  });
});
