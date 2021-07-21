import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';

import { Avatar } from './Avatar';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

// flaky in headless
it.skip('changes background on hover', async () => {
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
  const { fill: hoverFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );

  expect(hoverFill).not.toEqual(normalFill);
});

it.skip('can be passed a custom hover selector', async () => {
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
  const { fill: hoverFill } = await page.$eval(
    select(backgroundElement),
    (elem) => getComputedStyle(elem)
  );

  expect(hoverFill).not.toEqual(normalFill);
});
