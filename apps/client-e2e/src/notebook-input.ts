import { createInputBelow } from './page-utils/Block';
import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';

jest.setTimeout(60_000);

describe('notebook input', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('can create an input', async () => {
    await focusOnBody();
    await createInputBelow('Foo', 1337);
    await keyPress('Enter');
    expect((await page.textContent('text=1337'))!.trim()).toBe('1337');
  });

  it('can retrieve the value of an interactive input', async () => {
    const addInput = page.locator('button:has-text("Add")');
    await addInput.hover({ force: true });
    await addInput.click();
    await keyPress('Enter');
    await keyPress('ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await keyPress('Enter');
    const elem = await page.textContent('text=1,337');
    expect(elem!.trim()).toBe('1,337');
  });
});
