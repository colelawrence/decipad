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

export async function createCalculationBlockBelow(decilang: string) {
  await page.click('[contenteditable] p >> nth=-1');

  await page.keyboard.type('/');
  await waitForExpect(async () =>
    expect(
      await page.$$('[contenteditable] [role="menuitem"]')
    ).not.toHaveLength(0)
  );

  await page.keyboard.type('calc');
  await waitForExpect(async () =>
    expect(await page.$$('[contenteditable] [role="menuitem"]')).toHaveLength(1)
  );

  const { length: numCodeElements } = await page.$$('[contenteditable] code');
  await page.click('text=/calculation/i');
  await waitForExpect(async () =>
    expect(await page.$$('[contenteditable] code')).toHaveLength(
      numCodeElements + 1
    )
  );

  await page.keyboard.type(decilang);
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
    expectNoErrors
      ? codeBlock.waitForSelector('xpath=/output')
      : Promise.resolve(),
    timeout(2_010),
  ] as Promise<void>[]);

  const codeLines = await codeBlock.$$('code');
  const codeLinesWithResults = await Promise.all(
    codeLines.map(
      async (codeLine) =>
        [codeLine, (await codeLine.$$('//following::output'))[0]] as const
    )
  );

  const blockResult = await codeBlock.$('xpath=/output');

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
  const calculationBlocks = await page.$$(
    '//*[@contenteditable]//section[//code]'
  );
  return Promise.all(
    calculationBlocks.map((block) =>
      fetchCalculationBlock(block, expectNoErrors)
    )
  );
}
