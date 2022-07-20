import {
  focusOnBody,
  goToPlayground,
  keyPress,
  waitForEditorToLoad,
} from './page-utils/Pad';

beforeAll(goToPlayground);

beforeAll(() => waitForEditorToLoad());

it('inserts a link using markdown syntax', async () => {
  await focusOnBody();
  await page.keyboard.type('[text](https://example.com/)');
  const textElement = (await page.$('"text"'))!;
  const linkElement = await textElement.evaluateHandle(
    (text: HTMLElement) => text.closest('a')!
  );
  expect(await linkElement.getAttribute('href')).toEqual(
    'https://example.com/'
  );
});

it('inserts a magic number', async () => {
  await focusOnBody();
  await keyPress('Enter');
  await page.keyboard.type('= Foo = 4');
  await keyPress('Enter');
  await page.keyboard.type('The sentence meaning of life is %Foo%');
  const magicNumber = await page.$('"is 1"');
  expect(magicNumber).toBeDefined();
});

it('deleted a magic number', async () => {
  await focusOnBody();
  await keyPress('Backspace');
  const noMagic = await page.$('"1"');
  expect(noMagic).toBeNull();
});
