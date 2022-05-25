import { render, screen } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { AccountAvatar } from './AccountAvatar';

it('moves the caret down on hover', async () => {
  render(<AccountAvatar name="John Doe" menuOpen={false} />);
  const { select } = await domToPlaywright(page, document);
  const caretElement = screen.getByTitle(/expand/i).closest('svg')!;

  const { y: normalCaretY } = (await (await page.$(
    select(caretElement)
  ))!.boundingBox())!;
  await page.hover(select(screen.getByLabelText(/avatar/i)));
  await (await page.$(select(caretElement)))!.waitForElementState('stable');
  const { y: hoverCaretY } = (await (await page.$(
    select(caretElement)
  ))!.boundingBox())!;

  expect(hoverCaretY).toBeGreaterThan(normalCaretY);
});

it('moves the caret down when the menu is open', async () => {
  const { rerender } = render(
    <AccountAvatar name="John Doe" menuOpen={false} />
  );
  const { select, update } = await domToPlaywright(page, document);
  const expandElement = screen.getByTitle(/expand/i).closest('svg')!;

  const { y: normalCaretY } = (await (await page.$(
    select(expandElement)
  ))!.boundingBox())!;

  rerender(<AccountAvatar name="John Doe" menuOpen />);
  update(document);
  const collapseElement = screen.getByTitle(/collapse/i).closest('svg')!;
  await (await page.$(select(collapseElement)))!.waitForElementState('stable');
  const { y: openCaretY } = (await (await page.$(
    select(collapseElement)
  ))!.boundingBox())!;

  expect(openCaretY).toBeGreaterThan(normalCaretY);
});
