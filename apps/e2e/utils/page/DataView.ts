import { Page } from 'playwright';

export const getDataViewAsText = (
  page: Page,
  locator: string
): Promise<string> => page.locator(locator).innerHTML();
