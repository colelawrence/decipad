import { expect, test } from './manager/decipad-tests';
import startingACandleBusiness from '../__fixtures__/starting-a-candle-business.json';

test('Checks notebook embeds @embeds', async ({
  testUser,
  unregisteredUser,
}) => {
  test.slow();
  let embedUrl: string;

  await test.step('import candle business notebook', async () => {
    await testUser.importNotebook(startingACandleBusiness);
    await testUser.notebook.waitForEditorToLoad();
  });

  await test.step('modify slider values before publishing', async () => {
    await testUser.notebook.updateSlider('SalesFirstYear', '1200 unit');
    await testUser.notebook.updateSlider('SalesGrowth', '45%');
    await testUser.notebook.updateSlider('PriceUnit', '25$ /unit');
  });

  await test.step('publish notebook embed', async () => {
    embedUrl = await testUser.notebook.createEmbed();
  });

  await test.step('[unregisteredUser] checks clear changes button on embed in read mode', async () => {
    await unregisteredUser.page.goto(embedUrl);
    await unregisteredUser.notebook.waitForEditorToLoad();
    await unregisteredUser.notebook.getSliderLocator('SalesFirstYear').click();
    for (let i = 0; i < 7; i++) {
      await unregisteredUser.page.keyboard.press('ArrowLeft');
    }
    await unregisteredUser.page.keyboard.press('Backspace');
    await unregisteredUser.page.keyboard.type('1');
    await unregisteredUser.notebook.updateSlider('SalesGrowth', '40%');
    await unregisteredUser.notebook.updateSlider('PriceUnit', '20$ / unit');
    await unregisteredUser.page.getByText('Clear Changes').click();
    await unregisteredUser.notebook.waitForEditorToLoad();

    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesFirstYear')
    ).toContainText('1200 unit');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesGrowth')
    ).toContainText('45%');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('PriceUnit')
    ).toContainText('25$');
  });

  await test.step('[unregisteredUser] changes notebook values in read mode', async () => {
    await unregisteredUser.notebook.getSliderLocator('SalesFirstYear').click();
    for (let i = 0; i < 7; i++) {
      await unregisteredUser.page.keyboard.press('ArrowLeft');
    }
    await unregisteredUser.page.keyboard.press('Backspace');
    await unregisteredUser.page.keyboard.type('1');
    await unregisteredUser.notebook.updateSlider('SalesGrowth', '40%');
    await unregisteredUser.notebook.updateSlider('PriceUnit', '20$ / unit');
  });

  await test.step('[unregisteredUser] checks undo button in read mode', async () => {
    const undoButton = unregisteredUser.page.getByTestId('undo-button');

    while (!(await undoButton.isDisabled())) {
      await undoButton.click();
    }

    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesFirstYear')
    ).toContainText('1200 unit');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesGrowth')
    ).toContainText('45%');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('PriceUnit')
    ).toContainText('25$');
  });

  await test.step('[unregisteredUser] checks redo button in read mode', async () => {
    const redoButton = unregisteredUser.page.getByTestId('redo-button');

    while (!(await redoButton.isDisabled())) {
      await redoButton.click();
    }
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesFirstYear')
    ).toContainText('1100 unit');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('SalesGrowth')
    ).toContainText('40%');
    await expect(
      unregisteredUser.notebook.getSliderValueLocator('PriceUnit')
    ).toContainText('20$');
  });
});
