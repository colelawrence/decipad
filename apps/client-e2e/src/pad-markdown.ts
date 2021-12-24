import waitFor from 'wait-for-expect';
import {
  focusOnBody,
  goToPlayground,
  waitForEditorToLoad,
} from './page-utils/Pad';

beforeAll(goToPlayground);

beforeEach(waitForEditorToLoad);

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

it('opens an external target on click', async () => {
  // This is not to be taken for granted for an <a> in a Slate Editable...
  await page.click('"text"');
  await waitFor(() => {
    expect(context.pages()).toHaveLength(2);
    const [, newPage] = context.pages();
    expect(newPage.url()).toEqual('https://example.com/');
  });
});
