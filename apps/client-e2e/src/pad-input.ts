import { createInputBelow } from './page-utils/Block';
import { focusOnBody, setUp, waitForEditorToLoad } from './page-utils/Pad';

// eslint-disable-next-line jest/no-disabled-tests
describe('pad calculation block', () => {
  beforeAll(() => setUp());
  beforeAll(() => waitForEditorToLoad());

  it('starts empty', async () => {
    expect((await page.textContent('[contenteditable] h1'))!.trim()).toBe('');
    expect((await page.textContent('[contenteditable] p'))!.trim()).toBe('');
  });

  it('can create an input', async () => {
    await focusOnBody();
    await createInputBelow('Foo', 1337);
    expect((await page.textContent('text=1337'))!.trim()).toBe('1337');
  });

  it('can retrieve the value of an interactive input', async () => {
    await focusOnBody();
    await page.keyboard.type('That foo is %Foo% .');
    expect((await page.textContent('text=1,337'))!.trim()).toBe('1,337');
  });
});
