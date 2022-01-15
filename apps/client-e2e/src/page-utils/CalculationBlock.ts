import { ElementHandle } from 'playwright';
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
  await codeBlock.waitForSelector('output');

  const codeLines = await codeBlock.$$('code');
  const codeLinesWithResults = await Promise.all(
    codeLines.map(
      async (codeLine) =>
        [codeLine, (await codeLine.$('//following::output'))!] as const
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
