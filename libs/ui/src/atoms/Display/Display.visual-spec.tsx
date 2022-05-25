import { render, screen } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { Display } from './Display';

it('displays the placeholder text', async () => {
  render(
    <Display Heading="h1" placeholder="text goes here">
      text
    </Display>
  );
  const { select } = await domToPlaywright(page, document);

  const paragraph = await page.waitForSelector(
    select(screen.getByText('text').closest('h1')!)
  );
  const { content } = await paragraph.evaluate((p) =>
    getComputedStyle(p, '::before')
  );
  expect(content).toBe('"text goes here"');
});
