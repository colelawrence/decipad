import { Page } from 'playwright';

export const getCaretPosition = async (
  page: Page
): Promise<number | undefined> =>
  page.evaluate('window.getSelection()?.anchorOffset');
