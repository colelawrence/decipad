import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import waitFor from 'wait-for-expect';

import { Avatar } from './Avatar';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

// flaky in headless
it('changes background on hover', async () => {
  const { getByText, getByLabelText } = render(<Avatar userName="John Doe" />);
  const { select } = await domToPlaywright(page, document);
  const backgroundElement = [...getByText(/j/i).closest('svg')!.children].find(
    (element) => getComputedStyle(element).fill
  )!;

  const { fill: normalFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );
  await page.hover(select(getByLabelText(/avatar/i)));

  await waitFor(async () => {
    const { fill: hoverFill } = await page.$eval(
      select(backgroundElement),
      (elem) => getComputedStyle(elem)
    );

    expect(hoverFill).not.toEqual(normalFill);
  });
});

it('can be passed a custom hover selector', async () => {
  const { getByText } = render(
    <div className="some-class">
      <p>Some Paragraph</p>
      <Avatar userName="John Doe" hoverSelector=".some-class:hover" />
    </div>
  );
  const { select } = await domToPlaywright(page, document);
  const backgroundElement = [...getByText(/j/i).closest('svg')!.children].find(
    (element) => getComputedStyle(element).fill
  )!;

  const { fill: normalFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );
  await page.hover(select(getByText('Some Paragraph')));

  await waitFor(async () => {
    const { fill: hoverFill } = await page.$eval(
      select(backgroundElement),
      (elem) => getComputedStyle(elem)
    );

    expect(hoverFill).not.toEqual(normalFill);
  });
});
