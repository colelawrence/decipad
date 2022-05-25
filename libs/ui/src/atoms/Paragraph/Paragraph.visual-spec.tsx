import { render, screen } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { Paragraph } from './Paragraph';

it('displays the placeholder text', async () => {
  render(<Paragraph placeholder="text goes here">text</Paragraph>);
  const { select } = await domToPlaywright(page, document);

  const paragraph = await page.waitForSelector(
    select(screen.getByText('text').closest('p')!)
  );
  const { content } = await paragraph.evaluate((p) =>
    getComputedStyle(p, '::before')
  );
  expect(content).toBe('"text goes here"');
});
