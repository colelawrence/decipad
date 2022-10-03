import {
  createCalculationBlockBelow,
  getCodeLineContent,
  getResult,
} from './page-utils/Block';
import { keyPress, setUp, waitForEditorToLoad } from './page-utils/Pad';
import { getCaretPosition } from './utils';

describe('notebook calculation block', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  let lineNo = -1;

  it('Calculates 1 + 1', async () => {
    const lineText = '1 + 1';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const line = await getCodeLineContent(lineNo);
    expect(line).toBe(lineText);

    const result = await getResult(lineNo);
    expect(await result.allTextContents()).toMatchObject([
      expect.stringMatching(/2/i),
    ]);
  });

  it('Enter does a soft break inside parentesis', async () => {
    const lineText = '(10 + 2)';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    const lineBefore = await getCodeLineContent(lineNo);
    expect(lineBefore).toBe(lineText);

    await keyPress('ArrowLeft');
    await keyPress('ArrowLeft');
    await keyPress('Enter');

    const [left, right] = [lineText.slice(0, -2), lineText.slice(-2)];
    const brokenLine = `${left}\n${right}`;
    const lineAfter = await getCodeLineContent(lineNo);
    expect(lineAfter).toBe(brokenLine);
  });

  it('Enter moves caret to the end', async () => {
    const lineText = '3 + 7';
    await keyPress('ArrowDown');
    await createCalculationBlockBelow(lineText);

    lineNo += 1;

    await keyPress('ArrowLeft');
    await keyPress('ArrowLeft');
    const caretBefore = await getCaretPosition();

    await keyPress('Enter');

    const caretAfter = await getCaretPosition();
    expect(caretBefore).toBeDefined();
    expect(caretAfter).toBe(caretBefore! + 2);
  });
});
