import { findParentWithStyle } from '@decipad/dom-test-utils';
import {
  getAllByRole as getAllDescendantsByRole,
  render,
} from '@testing-library/react';
import { runCode } from '../../test-utils';

import { TableResult } from '..';

const code = 'my_table = { H1 = [1, 2], H2 = ["A", "B"]}';
it('renders an empty table', async () => {
  expect(
    render(<TableResult {...await runCode('empty_table = {}')} />)
  ).toBeDefined();
});
it('renders a table', async () => {
  const { getAllByRole } = render(<TableResult {...await runCode(code)} />);

  const headers = getAllByRole('columnheader');
  const cells = getAllByRole('cell');
  expect(headers).toHaveLength(2);
  expect(cells).toHaveLength(4);

  const th = headers.slice(0, 3);
  const thControls = headers.slice(3, -1);

  th.forEach((element) => expect(element).toBeVisible());
  thControls.forEach((element) => expect(element).not.toBeVisible());
  cells.forEach((element) => expect(element).toBeVisible());
});

it('render side padding on cells with non-tabular content', async () => {
  const { getByText } = render(<TableResult {...await runCode(code)} />);

  const cellPaddings = ['1', '2', 'A', 'B']
    .map((text) => getByText(text))
    .map((cell) => findParentWithStyle(cell, 'padding')!.padding);

  expect(cellPaddings).toEqual(Array(4).fill(expect.stringMatching(/.+/)));
});

describe('dimensions', () => {
  const dimensionalCode = `
    table1 = {
      col11 = ["A", "B", "C"]
      col12 = ["D", "E", "F"]
    }
    table2 = {
      col21 = table1
      col22 = table1
    }
  `;

  it('renders tables inside tables', async () => {
    const { container } = render(
      <TableResult {...await runCode(dimensionalCode)} />
    );

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(dimensions).toHaveLength(2);
  });
});
