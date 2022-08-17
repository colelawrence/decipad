import {
  focusOnBody,
  goToPlayground,
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
