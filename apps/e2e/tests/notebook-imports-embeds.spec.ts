import { expect, test, Page } from './manager/decipad-tests';
import { Timeouts, snapshot } from '../utils/src';

test.describe('structured input and calculations @calculation-blocks', () => {
  test('import images @imports @images', async ({ testUser }) => {
    const { page, notebook } = testUser;

    await test.step('Importing image through file explorer', async () => {
      await notebook.openImageUploader();
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Choose file').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('./__fixtures__/images/download.png');
      await expect(
        page.getByTestId('notebook-image-block').locator('img')
      ).toBeVisible();
      await snapshot(
        page as Page,
        'Notebook: Decipad logo image at biggest size'
      );
    });

    await test.step('Rezise image to smallest size', async () => {
      await page
        .getByTestId('notebook-image-block')
        .locator('div')
        .nth(3)
        .hover();
      await page.mouse.down();
      await page
        .getByTestId('notebook-image-block')
        .locator('div')
        .nth(2)
        .hover();
      await page.mouse.up();
      await snapshot(
        page as Page,
        'Notebook: Decipad logo image at smallest size'
      );
    });

    await test.step('set image caption', async () => {
      await page.getByTestId('draggable-block').nth(1).click();
      await page.getByTestId('notebook-image-caption').fill('Test Caption');
      await notebook.focusOnBody();
      await expect(page.getByTestId('notebook-image-caption')).toHaveText(
        'Test Caption'
      );
    });

    await test.step('delete image imported via file', async () => {
      await page.getByTestId('drag-handle').nth(1).click();
      await page.getByRole('menuitem', { name: 'Delete Delete' }).click();
      await expect(
        page.getByTestId('notebook-image-block').locator('img')
      ).toBeHidden();
    });

    await test.step('Importing image via link', async () => {
      await notebook.openImageUploader();
      await page.getByTestId('link-file-tab').click();
      await page
        .getByTestId('upload-link-input')
        .fill(
          'https://app.decipad.com/docs/assets/images/image_collab-1be976675d57684cb0a1223a5d6551ff.png'
        );
      await page.getByTestId('link-button').click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(
        page.getByTestId('notebook-image-block').locator('img')
      ).toBeVisible();
    });
  });

  test('import CSVs @imports @csv', async ({ testUser }) => {
    const { page, notebook } = testUser;
    await test.step('importing csv link through csv panel with link', async () => {
      await notebook.openCSVUploader();
      await page.getByRole('button', { name: 'Choose file' }).first().click();
      await page.getByTestId('link-file-tab').click();
      await page
        .getByTestId('upload-link-input')
        .fill(
          'https://docs.google.com/spreadsheets/d/e/2PACX-1vRlmKKmOm0b22FcmTTiLy44qz8TPtSipfvnd1hBpucDISH4p02r3QuCKn3LIOe2UFxotVpYdbG8KBSf/pub?gid=0&single=true&output=csv'
        );
      await page.getByTestId('link-button').click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }).toPass({
        timeout: 1000,
      });
      await page
        .getByTestId('integration-block')
        .filter({ hasText: /Variable/ })
        .getByTestId('segment-button-trigger')
        .click();
      await expect(
        page.getByText('20 rows, previewing rows 1 to 10')
      ).toBeVisible();
    });

    await test.step('importing csv file through csv panel with file', async () => {
      await notebook.openCSVUploader();
      await page.getByTestId('upload-file-tab').click();
      await page.getByRole('button', { name: 'Choose file' }).click();
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByText('Choose file').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles('./__fixtures__/csv/accounts.csv');
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page.getByTestId('live-code').getByTestId('loading-animation').first()
        ).toBeHidden();
      }, 'CSV from file upload took too much time to load').toPass({
        timeout: 1000,
      });
      await expect(async () => {
        await page
          .getByTestId('integration-block')
          .filter({ hasText: /accounts_c/ })
          .getByTestId('segment-button-trigger')
          .click();
        await expect(
          page.getByText('7109 rows, previewing rows 1 to 10')
        ).toBeVisible();
      }, 'CSV table not added to notebook after csv upload').toPass();
    });

    await test.step('delete csvs', async () => {
      await expect(async () => {
        await page.locator(`[data-testid="drag-handle"] >> nth=0`).click();
        await page.getByRole('menuitem', { name: /Delete/ }).click();
        await expect(page.getByTestId('integration-block')).toBeHidden();
      }, "Wasn't able to delete all CSV tables").toPass();
      await page.reload();
      await notebook.waitForEditorToLoad();
      await expect(
        page.getByTestId('integration-block'),
        'CSV Tables still present after being deleted and realoading notebook'
      ).toBeHidden();
    });
  });

  test('embed on deipad @embeds', async ({ testUser }) => {
    const { page, notebook } = testUser;
    await test.step('embed from loom', async () => {
      await notebook.openEmbedUploader();
      await page
        .getByTestId('upload-link-input')
        .fill(
          'https://www.loom.com/embed/fdd9cc32f4b2494ca4e4e4420795d2e0?sid=e1964b86-c0a2-424c-8b12-df108627ecd2'
        );
      await page.getByTestId('link-button').click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(
        page
          .frameLocator('iframe[title="decipad-embed"]')
          .nth(0)
          .getByRole('link', {
            name: 'Loom video for E2E',
          })
          .first()
      ).toBeVisible();
    });
    await test.step('embed from google slides', async () => {
      await notebook.openEmbedUploader();
      await page
        .getByTestId('upload-link-input')
        .fill(
          'https://docs.google.com/presentation/d/e/2PACX-1vR4fKEEmGwjs7JUioJup8U4ERoV7xkVc2NEJdhNlAfIQRo-uShVPz2EERzEef8K5vAoqr4TBgTO8dMC/embed?start=false&loop=false&delayms=3000'
        );
      await page.getByTestId('link-button').click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(
        page
          .frameLocator('iframe[title="decipad-embed"]')
          .nth(1)
          .getByRole('link', { name: 'Google Slides' })
      ).toBeVisible();
    });

    await test.step('embed from pitch', async () => {
      await notebook.openEmbedUploader();
      await page
        .getByTestId('upload-link-input')
        .fill('https://pitch.com/embed/d32f33f3-1ac8-4d44-aee6-672899febcf9');
      await page.getByTestId('link-button').click();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(Timeouts.computerDelay);
      await expect(async () => {
        await expect(
          page
            .frameLocator('iframe[title="decipad-embed"]')
            .nth(2)
            .locator('[data-test-id="read-only-text"]')
            .getByText('Pitch Slides Decipad')
        ).toBeVisible();
      }, `Pitch Embed didn't load properly`).toPass();
    });
  });
});
