import { Locator } from 'playwright-core';
import waitForExpect from 'wait-for-expect';
import { cleanText } from '../utils';

export async function createInputBelow(identifier: string, value: number) {
  await page.click('[contenteditable] p >> nth=-1');

  await page.keyboard.insertText('/input');

  await waitForExpect(async () =>
    expect(
      await page.$$('[contenteditable] [role="menuitem"]')
    ).not.toHaveLength(0)
  );

  await page.click('text=InputInputA value that others can interact with');

  await page.locator('text=/Input[0-9]+/ >> nth=-1').dblclick();
  await page.keyboard.press('Backspace');

  await page.keyboard.type(identifier);

  await page.click('div [data-testid="input-widget-name"]');

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
    const lastCodeLine = await page.$('[contenteditable] code >> nth=-1');
    expect(lastCodeLine).toBeDefined();
  });
}

export function getCodeLineBlockLocator() {
  return page.locator('//*[@contenteditable][//code]') as Locator;
}

export function getCodeLines() {
  return getCodeLineBlockLocator().locator('code');
}

export function getResults() {
  return getCodeLineBlockLocator().locator('output');
}

export async function getCodeLineContent(n: number) {
  const lineContent = (await getCodeLines().nth(n).allTextContents()).join();
  return cleanText(lineContent);
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

  await waitForExpect(async () => {
    expect(await locator.allTextContents()).not.toMatchObject(['?']);
  });
  return locator;
}
