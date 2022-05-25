import { render, screen } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import waitFor from 'wait-for-expect';
import { Avatar } from './Avatar';

it('changes background on hover', async () => {
  render(<Avatar name="John Doe" />);
  const { select } = await domToPlaywright(page, document);
  const backgroundElement = [
    ...screen.getByText(/j/i).closest('svg')!.children,
  ].find((element) => getComputedStyle(element).fill)!;

  const { fill: normalFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );
  await page.hover(select(screen.getByLabelText(/avatar/i)));

  await waitFor(async () => {
    const { fill: hoverFill } = await page.$eval(
      select(backgroundElement),
      (elem) => getComputedStyle(elem)
    );

    expect(hoverFill).not.toEqual(normalFill);
  });
});

it('can be passed a custom hover selector', async () => {
  render(
    <div className="some-class">
      <p>Some Paragraph</p>
      <Avatar name="John Doe" hoverSelector=".some-class:hover" />
    </div>
  );
  const { select } = await domToPlaywright(page, document);
  const backgroundElement = [
    ...screen.getByText(/j/i).closest('svg')!.children,
  ].find((element) => getComputedStyle(element).fill)!;

  const { fill: normalFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );
  await page.hover(select(screen.getByText('Some Paragraph')));

  await waitFor(async () => {
    const { fill: hoverFill } = await page.$eval(
      select(backgroundElement),
      (elem) => getComputedStyle(elem)
    );

    expect(hoverFill).not.toEqual(normalFill);
  });
});
