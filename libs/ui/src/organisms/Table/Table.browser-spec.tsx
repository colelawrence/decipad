import { render } from '@testing-library/react';
import domToPlaywright from 'dom-to-playwright';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { Table } from './Table';

const emptyBorder = '0px none rgb(0, 0, 0)';

const body = (
  <tbody>
    <TableRow readOnly>
      <TableData>Cell 1.1</TableData>
      <TableData>Cell 1.2</TableData>
    </TableRow>
    <TableRow readOnly>
      <TableData>Cell 2.1</TableData>
      <TableData>Cell 2.2</TableData>
    </TableRow>
  </tbody>
);

describe('border prop', () => {
  it('displays the inner borders', async () => {
    const { getAllByRole } = render(<Table border="inner">{body}</Table>);

    const { select } = await domToPlaywright(page, document);

    const cells = getAllByRole('cell');
    const cellStyles = await Promise.all(
      cells.map((cell) =>
        page.$eval(select(cell), (elem) => getComputedStyle(elem))
      )
    );

    expect(cellStyles[0].borderLeft).toBe(emptyBorder);
    expect(cellStyles[0].borderTop).toBe(emptyBorder);
    expect(cellStyles[0].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[0].borderBottom).not.toBe(emptyBorder);

    expect(cellStyles[1].borderLeft).toBe(emptyBorder);
    expect(cellStyles[1].borderTop).toBe(emptyBorder);
    expect(cellStyles[1].borderRight).toBe(emptyBorder);
    expect(cellStyles[1].borderBottom).not.toBe(emptyBorder);

    expect(cellStyles[2].borderLeft).toBe(emptyBorder);
    expect(cellStyles[2].borderTop).toBe(emptyBorder);
    expect(cellStyles[2].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[2].borderBottom).toBe(emptyBorder);

    expect(cellStyles[3].borderLeft).toBe(emptyBorder);
    expect(cellStyles[3].borderTop).toBe(emptyBorder);
    expect(cellStyles[3].borderRight).toBe(emptyBorder);
    expect(cellStyles[3].borderBottom).toBe(emptyBorder);
  });

  it('displays all borders by default', async () => {
    const { getAllByRole } = render(<Table>{body}</Table>);

    const { select } = await domToPlaywright(page, document);

    const cells = getAllByRole('cell');
    const cellStyles = await Promise.all(
      cells.map((cell) =>
        page.$eval(select(cell), (elem) => getComputedStyle(elem))
      )
    );

    expect(cellStyles[0].borderLeft).not.toBe(emptyBorder);
    expect(cellStyles[0].borderTop).not.toBe(emptyBorder);
    expect(cellStyles[0].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[0].borderBottom).not.toBe(emptyBorder);

    expect(cellStyles[1].borderLeft).toBe(emptyBorder);
    expect(cellStyles[1].borderTop).not.toBe(emptyBorder);
    expect(cellStyles[1].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[1].borderBottom).not.toBe(emptyBorder);

    expect(cellStyles[2].borderLeft).not.toBe(emptyBorder);
    expect(cellStyles[2].borderTop).toBe(emptyBorder);
    expect(cellStyles[2].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[2].borderBottom).not.toBe(emptyBorder);

    expect(cellStyles[3].borderLeft).toBe(emptyBorder);
    expect(cellStyles[3].borderTop).toBe(emptyBorder);
    expect(cellStyles[3].borderRight).not.toBe(emptyBorder);
    expect(cellStyles[3].borderBottom).not.toBe(emptyBorder);
  });
});
