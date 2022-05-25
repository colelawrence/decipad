import { render, screen } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { TableData } from './TableData';

afterEach(async () => {
  await jestPlaywright.resetPage();
});

it('renders the row number on the first cell', async () => {
  render(
    <table>
      <tbody>
        <tr>
          <TableData as="td">Td Element</TableData>
          <TableData as="td">Td Element2</TableData>
        </tr>
      </tbody>
    </table>
  );
  const { select } = await domToPlaywright(page, document);

  const tableDataElement = screen.getByText('Td Element').closest('td')!;

  const { content } = await page.$eval(select(tableDataElement), (elem) =>
    getComputedStyle(elem, ':before')
  );

  expect(content).toMatchInlineSnapshot(`"counter(table-row)"`);
});

it('does not render the row number on the second cell', async () => {
  render(
    <table>
      <tbody>
        <tr>
          <TableData as="td">Td Element</TableData>
          <TableData as="td">Td Element2</TableData>
        </tr>
      </tbody>
    </table>
  );
  const { select } = await domToPlaywright(page, document);

  const tableDataElement = screen.getByText('Td Element2').closest('td')!;

  const { content } = await page.$eval(select(tableDataElement), (elem) =>
    getComputedStyle(elem, ':before')
  );

  expect(content).toBe('none');
});
