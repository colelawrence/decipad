import {
  render,
  getAllByRole as getAllDescendantsByRole,
} from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { runCode } from '../../test-utils';

import { RowResult } from '..';

const code = `
  Table = {
    Names = ["Adam", "Eve"]
    Dates = [date(2030), date(2069)]
  }
  Table

  lookup(Table, Table.Dates == date(2030))
`;
it('renders a single body row table', async () => {
  const { getAllByRole } = render(<RowResult {...await runCode(code)} />);

  const rows = getAllByRole('row');

  expect(rows.map((row) => row.parentElement?.tagName)).toEqual([
    'THEAD',
    'TBODY',
    'TFOOT',
  ]);
});

it('render side padding on cells with non-tabular content', async () => {
  const { getByText } = render(<RowResult {...await runCode(code)} />);

  const cellPaddings = ['Adam', '2030']
    .map((text) => getByText(text))
    .map((cell) => findParentWithStyle(cell, 'padding')!.padding);

  expect(cellPaddings).toEqual(Array(2).fill(expect.stringMatching(/.+/)));
});

describe('dimensions', () => {
  const dimensionalCode = `
    Table = {
      Numbers = [[1, 2], [3, 4]]
      MoreNumbers = [[5, 6], [7, 8]]
      Names = ["Adam", "Eve"]
    }
    Table

    lookup(Table, Table.Names == "Adam")
  `;

  it('renders tables inside tables', async () => {
    const { container } = render(
      <RowResult {...await runCode(dimensionalCode)} />
    );

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(dimensions).toHaveLength(2);
  });

  it('renders left padding on first column cells containing another dimension', async () => {
    const { container } = render(
      <RowResult {...await runCode(dimensionalCode)} />
    );

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(
      dimensions.map(
        (cell) => findParentWithStyle(cell, 'paddingLeft')?.paddingLeft
      )
    ).toEqual([expect.stringMatching(/.+/), undefined]);
    expect(
      dimensions.map((cell) => findParentWithStyle(cell, 'padding')?.padding)
    ).toEqual([undefined, undefined]);
  });
});
