import { Page } from '@playwright/test';

export const getCaretPosition = (page: Page): Promise<number | undefined> =>
  page.evaluate('window.getSelection()?.anchorOffset');
