import { Page } from '@playwright/test';

export const getDataViewAsText = (
  page: Page,
  locator: string
): Promise<string> => page.locator(locator).innerHTML();
