import waitForExpect from 'wait-for-expect';

export async function createTable() {
  await page.click('[contenteditable] p >> nth=-1');

  await page.keyboard.insertText('/table');

  await waitForExpect(async () =>
    expect(
      await page.$$('[contenteditable] [role="menuitem"]')
    ).not.toHaveLength(0)
  );

  await page.click('text=tableslashTableEmpty table to structure your data');
}

export async function writeInTable(text: string, line: number, col = 0) {
  const parentType = line === 0 ? 'thead' : 'tbody';
  const cellType = line === 0 ? 'th' : 'td';
  const lineNumber = line > 0 ? line - 1 : line;
  const locator = `table > ${parentType} > tr:nth-child(${
    lineNumber + 1
  }) > ${cellType}:nth-child(${col + 1})`;
  const cell = await page.locator(locator);
  await cell.click();
  await page.keyboard.type(text);
}

export async function createInputBelow(identifier: string, value: number) {
  await page.click('[contenteditable] p >> nth=-1');

  await page.keyboard.insertText('/input');

  await waitForExpect(async () =>
    expect(
      await page.$$('[contenteditable] [role="menuitem"]')
    ).not.toHaveLength(0)
  );

  await page.click(
    'text=InputInputShare your notebook and have others interact with it'
  );

  await page.click('div [aria-placeholder="Name your input"]');

  await page.keyboard.type(identifier);

  await page.click('div [aria-placeholder="1 km"]');

  await page.keyboard.type(value.toString());
}

export async function createCalculationBlockBelow(decilang: string) {
  await page.click('[contenteditable] p >> nth=-1');

  const { length: numCodeElements } = await page.$$('[contenteditable] code');

  await page.waitForTimeout(100);
  await page.keyboard.type('=');

  await waitForExpect(
    async () =>
      expect(await page.$$('[contenteditable] code')).toHaveLength(
        numCodeElements + 1
      ),
    10_000
  );

  await page.keyboard.type(decilang);

  await waitForExpect(async () => {
    const lastCode = await page.$('[contenteditable] code >> nth=-1');
    expect((await lastCode?.textContent())?.includes(decilang)).toBeTruthy();
  });
}

export function getCodeLineBlockLocator() {
  return page.locator('//*[@contenteditable][//code]');
}

export function getCodeLines() {
  return getCodeLineBlockLocator().locator('code');
}

export function getResults() {
  return getCodeLineBlockLocator().locator('output');
}

export async function getCodeLineContent(n: number) {
  return (await getCodeLines().nth(n).allTextContents()).join();
}

export async function getResult(n: number) {
  const locator = getResults().nth(n);
  // Computer results have a throttle and may take some time to display.
  // HACK: should be able to use `locator.waitFor()` instead (see
  // https://playwright.dev/docs/api/class-locator#locator-wait-for) but jest-playwright is not
  // being actively maintained and because of that we can't upgrade playwright to v1.16 where this
  // new function was release.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  await page.waitForSelector(locator._selector);
  return locator;
}
