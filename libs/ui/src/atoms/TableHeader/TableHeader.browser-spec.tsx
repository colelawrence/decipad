import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';

import { TableHeader } from './TableHeader';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

describe('rightSlot prop', () => {
  it('renders hidden when provided', async () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader rightSlot="Right">Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    const { select } = await domToPlaywright(page, document);
    const { opacity } = await page.$eval(select(getByText('Right')), (elem) =>
      getComputedStyle(elem)
    );

    expect(opacity).toBe('0');
  });

  it('is visible when table header is hovered', async () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader rightSlot="Right">Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    const { select } = await domToPlaywright(page, document);

    await page.hover(select(getByText('Th Element').closest('th')!));

    const { opacity } = await page.$eval(select(getByText('Right')), (elem) =>
      getComputedStyle(elem)
    );

    expect(opacity).toBe('1');
  });

  it('is visible when table header children are focused', async () => {
    const { getByDisplayValue, getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader rightSlot="Right">
              <input defaultValue="Th Element" />
            </TableHeader>
          </tr>
        </thead>
      </table>
    );

    const { select } = await domToPlaywright(page, document);

    await page.focus(select(getByDisplayValue('Th Element')));

    const { opacity } = await page.$eval(select(getByText('Right')), (elem) =>
      getComputedStyle(elem)
    );

    expect(opacity).toBe('1');
  });
});
