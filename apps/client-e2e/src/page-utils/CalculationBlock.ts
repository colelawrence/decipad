import { timeout } from '@decipad/utils';
import { ElementHandle } from 'playwright';
import waitForExpect from 'wait-for-expect';
import { keyPress } from './Pad';

interface CalculationBlockLine {
  code: string;
  result: string;
}

interface CalculationBlock {
  lines: CalculationBlockLine[];
  result: ElementHandle | null;
}

export async function createCalculationBlock(decilang: string) {
  await page.keyboard.type('/calc');
  await keyPress('Tab');
  await keyPress('Enter');
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
  codeBlock: ElementHandle
): Promise<CalculationBlock> {
  // wait for the results to show up
  await Promise.all([
    waitForExpect(async () =>
      expect(await codeBlock.$$('output')).not.toHaveLength(0)
    ),
    timeout(500),
  ]);

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

export async function getCalculationBlocks(): Promise<CalculationBlock[]> {
  const calculationBlocks = await page.$$(
    '//*[@contenteditable]//section[//code]'
  );
  return Promise.all(calculationBlocks.map(fetchCalculationBlock));
}
