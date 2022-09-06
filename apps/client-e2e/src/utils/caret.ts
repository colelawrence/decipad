export const getCaretPosition = async (): Promise<number | undefined> =>
  page.evaluate('window.getSelection()?.anchorOffset');
