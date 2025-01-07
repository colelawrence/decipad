import { expect, test } from './manager/decipad-tests';

test('auto complete menu basic checks', async ({ testUser }) => {
  await test.step('searching', async () => {
    await testUser.notebook.focusOnBody();
    await testUser.page.keyboard.type('/input');
    await expect(
      testUser.page.getByText('Model', { exact: true })
    ).toBeVisible();
    await expect(
      testUser.page.getByTestId('menu-item-structured-input')
    ).toBeVisible();
    await expect(testUser.page.getByText('Widgets')).toBeVisible();
    await expect(testUser.page.getByTestId('menu-item-input')).toBeVisible();
    await expect(testUser.page.getByTestId('menu-item-slider')).toBeVisible();
    await expect(
      testUser.page.getByTestId('menu-item-datepicker')
    ).toBeVisible();
  });
});
