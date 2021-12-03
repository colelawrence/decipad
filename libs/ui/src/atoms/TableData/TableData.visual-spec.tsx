import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';

import { TableData } from './TableData';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

it('renders the row number on the first cell', async () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <TableData>Td Element</TableData>
          <TableData>Td Element2</TableData>
        </tr>
      </tbody>
    </table>
  );
  const { select } = await domToPlaywright(page, document);

  const tableDataElement = getByText('Td Element').closest('td')!;

  const { content } = await page.$eval(select(tableDataElement), (elem) =>
    getComputedStyle(elem, ':before')
  );

  expect(content).toMatchInlineSnapshot(`"counter(table-row)"`);
});

it('does not render the row number on the second cell', async () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <TableData>Td Element</TableData>
          <TableData>Td Element2</TableData>
        </tr>
      </tbody>
    </table>
  );
  const { select } = await domToPlaywright(page, document);

  const tableDataElement = getByText('Td Element2').closest('td')!;

  const { content } = await page.$eval(select(tableDataElement), (elem) =>
    getComputedStyle(elem, ':before')
  );

  expect(content).toBe('none');
});
