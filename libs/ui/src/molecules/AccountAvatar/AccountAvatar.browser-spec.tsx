import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';

import { AccountAvatar } from './AccountAvatar';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

it('moves the caret down on hover', async () => {
  const { getByLabelText, getByTitle } = render(
    <AccountAvatar userName="John Doe" menuOpen={false} />
  );
  const { select } = await domToPlaywright(page, document);
  const caretElement = getByTitle(/expand/i).closest('svg')!;

  const { y: normalCaretY } = (await (await page.$(
    select(caretElement)
  ))!.boundingBox())!;
  await page.hover(select(getByLabelText(/avatar/i)));
  await (await page.$(select(caretElement)))!.waitForElementState('stable');
  const { y: hoverCaretY } = (await (await page.$(
    select(caretElement)
  ))!.boundingBox())!;

  expect(hoverCaretY).toBeGreaterThan(normalCaretY);
});

it('moves the caret down when the menu is open', async () => {
  const { getByTitle, rerender } = render(
    <AccountAvatar userName="John Doe" menuOpen={false} />
  );
  const { select, update } = await domToPlaywright(page, document);
  const expandElement = getByTitle(/expand/i).closest('svg')!;

  const { y: normalCaretY } = (await (await page.$(
    select(expandElement)
  ))!.boundingBox())!;

  rerender(<AccountAvatar userName="John Doe" menuOpen />);
  update(document);
  const collapseElement = getByTitle(/collapse/i).closest('svg')!;
  await (await page.$(select(collapseElement)))!.waitForElementState('stable');
  const { y: openCaretY } = (await (await page.$(
    select(collapseElement)
  ))!.boundingBox())!;

  expect(openCaretY).toBeGreaterThan(normalCaretY);
});
