import type { Page } from './manager/decipad-tests';
import { expect, test } from './manager/decipad-tests';
import { snapshot } from '../utils/src';
import { app } from '@decipad/backend-config';

test('check playground @playground', async ({ unregisteredUser }) => {
  const { page, notebook } = unregisteredUser;
  await page.goto(`${app().urlBase}/playground`);
  await notebook.waitForEditorToLoad();
  await notebook.addSliderWidget();
  await expect(notebook.getSliderLocator('Slider')).toBeVisible();
  await expect(page.getByText('Log-in')).toBeVisible();
  await expect(page.getByText('Decipad — Playground')).toBeVisible();

  await snapshot(page as Page, 'Playground');
  await page.getByText('Log-in').click();
  await expect(page.getByText('Welcome to Decipad!')).toBeVisible();
});
