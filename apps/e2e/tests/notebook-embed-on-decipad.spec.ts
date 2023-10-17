import { BrowserContext, Page, expect, test } from '@playwright/test';
import { setUp } from '../utils/page/Editor';
import { Timeouts } from '../utils/src';
import { createEmbedBelow } from '../utils/page/Block';

test.describe('Testing embedding on decipad', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let context: BrowserContext;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    context = page.context();

    await setUp(
      { page, context },
      {
        createAndNavigateToNewPad: true,
      }
    );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('embed from loom', async () => {
    await createEmbedBelow(page);
    await page
      .getByTestId('upload-link-input')
      .fill(
        'https://www.loom.com/embed/e18301fb8aa748eca8f7be0ce38c9e6a?sid=726a1216-91e3-4c61-9f55-8190c2ffa632'
      );
    await page.getByTestId('link-button').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page
        .frameLocator('iframe[title="decipad-embed"]')
        .nth(0)
        .getByRole('link', {
          name: 'Introduction to DesiPad 101 👋',
        })
        .first()
    ).toBeVisible();
  });
  test('embed from google slides', async () => {
    await createEmbedBelow(page);
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

  test('embed from pitch', async () => {
    await createEmbedBelow(page);
    await page
      .getByTestId('upload-link-input')
      .fill('https://pitch.com/embed/d32f33f3-1ac8-4d44-aee6-672899febcf9');
    await page.getByTestId('link-button').click();
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(Timeouts.computerDelay);
    await expect(
      page
        .frameLocator('iframe[title="decipad-embed"]')
        .nth(2)
        .locator('[data-test-id="read-only-text"]')
        .getByText('Pitch Slides Decipad')
    ).toBeVisible();
  });
});
