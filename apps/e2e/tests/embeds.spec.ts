import { expect, test } from './manager/decipad-tests';
import startingACandleBusiness from '../__fixtures__/starting-a-candle-business.json';
import { waitForEditorToLoad } from 'apps/e2e/utils/page/Editor';

test('Embeds', async ({ testUser, unregisteredUser }) => {
  let embedUrl: string;
  await test.step('load candle business notebook', async () => {
    testUser.importNotebook(startingACandleBusiness);
    await waitForEditorToLoad(testUser.page);
  });

  await test.step('modify values', async () => {
    await testUser.notebook.updateSlider(0, '1200 unit');
    await testUser.notebook.updateSlider(1, '45%');
    await testUser.notebook.updateSlider(2, '25$ /unit');

    embedUrl = await testUser.notebook.createEmbed();
  });

  await test.step('check embed', async () => {
    await unregisteredUser.page.goto(embedUrl);
    await unregisteredUser.page.getByTestId('widget-input').nth(0).click();
    for (let i = 0; i < 7; i++) {
      await unregisteredUser.page.keyboard.press('ArrowLeft');
    }
    await unregisteredUser.page.keyboard.press('Backspace');
    await unregisteredUser.page.keyboard.type('1');
    await unregisteredUser.notebook.updateSlider(1, '40%');
    await unregisteredUser.notebook.updateSlider(2, '20$ / unit');
    await unregisteredUser.page.getByText('Clear Changes').click();
    await unregisteredUser.notebook.waitForEditorToLoad();

    const [slider1Text, slider2Text, slider3Text] = await Promise.all([
      unregisteredUser.page.getByTestId('widget-input').nth(0).textContent(),
      unregisteredUser.page.getByTestId('widget-input').nth(1).textContent(),
      unregisteredUser.page.getByTestId('widget-input').nth(2).textContent(),
    ]);
    expect(slider1Text).toBe('1000 unit');
    expect(slider2Text).toBe('45%');
    expect(slider3Text).toContain('25$');
  });
});
