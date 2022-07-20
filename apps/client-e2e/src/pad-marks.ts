import { createCalculationBlockBelow } from './page-utils/Block';
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

const valueOfFoo = 120;

it('inserts a magic number', async () => {
  await focusOnBody();
  await keyPress('Enter');
  await createCalculationBlockBelow(`Time = ${valueOfFoo} minutes`);
  await keyPress('Enter');
  await page.keyboard.type('You have %Time% to live - %Time in seconds%');
  const magicNumber = await page.$$(`span[title="${valueOfFoo * 60}"]`);
  const notMagicNumber = await page.$$(`span[title="${1 + valueOfFoo * 60}"]`);
  expect(magicNumber).not.toEqual([]);
  expect(notMagicNumber).toEqual([]);
});

it('can use an expression in magic number', async () => {
  expect((await page.textContent('text=7,200 seconds'))!.trim()).not.toBeNull();
});

it('deleted a magic number', async () => {
  await keyPress('Backspace');
  await keyPress('Backspace');
  const magicNumber = await page.$$(`span[title="${valueOfFoo * 60}"]`);
  expect(magicNumber).toEqual([]);
});

it('undefined var magic number shows loading', async () => {
  await focusOnBody();
  await keyPress('Enter');
  await page.keyboard.type('This is %Undefined% ');
  expect(await page.textContent('p svg title')).toBe('Loading');
});

it('error magic var shows loading', async () => {
  await keyPress('Backspace');
  await keyPress('Backspace');
  await keyPress('Enter');
  await page.keyboard.type('This is %1/0%');
  expect(await page.textContent('p svg title')).toBe('Loading');
});
