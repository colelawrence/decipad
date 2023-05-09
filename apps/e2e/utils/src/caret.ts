import { Page } from 'playwright';

export const getCaretPosition = (page: Page): Promise<number | undefined> =>
  page.evaluate('window.getSelection()?.anchorOffset');
