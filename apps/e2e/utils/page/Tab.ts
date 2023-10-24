import { Page } from '@playwright/test';
import { ControlPlus } from 'apps/e2e/utils/page/Editor';

export const createTab = async (page: Page, name: string | null = null) => {
  await page.getByTestId('add-tab-button').click();

  if (name) {
    await ControlPlus(page, 'A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(name);
    await page.keyboard.press('Enter');
  }
};

export const getTabName = async (page: Page, index: number) => {
  return page.locator(`[data-testid="tab-name"] >> nth=${index}`).textContent();
};

export const selectTab = async (page: Page, index: number) => {
  await page.locator(`[data-testid="tab-name"] >> nth=${index}`).click();
};
