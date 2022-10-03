import waitForExpect from 'wait-for-expect';
import { createInputBelow } from './page-utils/Block';
import {
  focusOnBody,
  keyPress,
  setUp,
  waitForEditorToLoad,
} from './page-utils/Pad';

// eslint-disable-next-line jest/no-disabled-tests
describe('notebook input', () => {
  beforeAll(setUp);
  beforeAll(waitForEditorToLoad);

  it('starts empty', async () => {
    const title = '[contenteditable] h1';
    const paragraph = '[data-testid=paragraph-content]';

    expect((await page.textContent(title))!.trim()).toBe('');
    expect((await page.textContent(paragraph))!.trim()).toBe('');
  });

  it('can create an input', async () => {
    await focusOnBody();
    await createInputBelow('Foo', 1337);
    await keyPress('Enter');
    expect((await page.textContent('text=1337'))!.trim()).toBe('1337');
  });

  it('can retrieve the value of an interactive input', async () => {
    await keyPress('Enter');
    await keyPress('ArrowDown');
    await page.keyboard.type('That foo is %Foo% .');
    await keyPress('Enter');
    await waitForExpect(async () => {
      const elem = await page.textContent('text=1,337');
      return expect(elem!.trim()).toBe('1,337');
    });
  });
});
