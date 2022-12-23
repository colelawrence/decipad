import { Page } from 'playwright';

export const getDataViewAsText = async (
  page: Page,
  locator: string
): Promise<string> => {
  return page.locator(locator).innerHTML();
};
