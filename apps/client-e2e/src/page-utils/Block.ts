import { timeout } from '@decipad/utils';
import { ElementHandle } from 'playwright';
import waitForExpect from 'wait-for-expect';

interface CalculationBlockLine {
  code: string;
  result: string;
}

interface CalculationBlock {
  lines: CalculationBlockLine[];
  result: ElementHandle | null;
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

  await page.keyboard.type('=');

  await waitForExpect(async () =>
    expect(await page.$$('[contenteditable] code')).toHaveLength(
      numCodeElements + 1
    )
  );

  await page.keyboard.type(decilang);

  await waitForExpect(async () => {
    const lastCode = await page.$('[contenteditable] code >> nth=-1');
    expect(await lastCode?.textContent()).toEqual(decilang);
  });
}

async function stringifyCodeLineAndResult([codeLine, lineResult]: Readonly<
  [ElementHandle, ElementHandle]
>): Promise<CalculationBlockLine> {
  return {
    code: (await codeLine.textContent()) ?? '',
    result: (await lineResult.textContent()) ?? '',
  };
}

async function fetchCalculationBlock(
  codeBlock: ElementHandle,
  expectNoErrors = false
): Promise<CalculationBlock> {
  // Wait for the results to show up.
  // It's hard to tell if these results are current since outdated ones to not immediately vanish,
  // so better wait a little longer.
  await Promise.all([
    waitForExpect(async () =>
      expect(await codeBlock.$$('output')).not.toHaveLength(0)
    ),
    expectNoErrors ? codeBlock.waitForSelector('output') : Promise.resolve(),
    timeout(2_010),
  ] as Promise<void>[]);

  const codeLines = await codeBlock.$$('code');
  const codeLinesWithResults = await Promise.all(
    codeLines.map(async (codeLine) => {
      const output = (await codeLine.$$('output'))[0];
      return [codeLine, output] as const;
    })
  );

  const blockResult = await codeBlock.$('output');

  return {
    lines: await Promise.all(
      codeLinesWithResults.map(stringifyCodeLineAndResult)
    ),
    result: blockResult,
  };
}

export async function getCalculationBlocks(
  expectNoErrors = false
): Promise<CalculationBlock[]> {
  let blocks: ElementHandle[] = [];

  await waitForExpect(async () => {
    // waitForExpect doesn't propagate the returned value
    blocks = await page.$$('//*[@contenteditable][//code]');
    expect(blocks.length).toBeGreaterThan(0);
  });
  return Promise.all(
    blocks.map((block) => fetchCalculationBlock(block, expectNoErrors))
  );
}
