import { FC } from 'react';
import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { TestResultsProvider } from '@decipad/react-contexts';
import { NotebookResults } from '@decipad/computer';

import { runCode } from '../../test-utils';
import { ColumnResult } from '..';

function withResultContextWrapper(
  value: Partial<NotebookResults>
): FC<React.PropsWithChildren<unknown>> {
  return ({ children }) => {
    return <TestResultsProvider {...value}>{children}</TestResultsProvider>;
  };
}

// eslint-disable-next-line jest/no-disabled-tests
it.skip('renders a single column table', async () => {
  const { getAllByRole } = render(
    <ColumnResult {...await runCode('[1, 2, 3]')} />
  );

  const rows = getAllByRole('row');
  const cells = getAllByRole('cell');

  expect(rows).toHaveLength(4);
  expect(cells).toHaveLength(6);
  cells.forEach((cell) => expect(cell).toBeVisible());
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('renders padding on cells contents', async () => {
  const { getByText } = render(
    <ColumnResult {...await runCode('[10, 20, 30]')} />
  );

  const cellPaddings = ['10', '20', '30']
    .map((text) => getByText(text))
    .map((cell) => findParentWithStyle(cell, 'paddingLeft')!.paddingLeft);
  expect(cellPaddings).toEqual([
    expect.stringMatching(/.+/),
    expect.stringMatching(/.+/),
    expect.stringMatching(/.+/),
  ]);
});

describe('dimensions', () => {
  const code = `
    table = {
      H1 = ["A", "B", "C"]
      H2 = [10, 20, 30]
    }
    list = [1, 2, 3]
    list + table.H2
  `;
  const indexLabels = new Map([['table', ['A', 'B', 'C']]]);

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('renders a bidimensional column', async () => {
    const { container } = render(<ColumnResult {...await runCode(code)} />, {
      wrapper: withResultContextWrapper({ indexLabels }),
    });

    const rows = [...container.querySelectorAll('tbody > tr')];

    expect(rows).toHaveLength(9);

    const cells = rows.map((row) => {
      const roww = [...row.querySelectorAll('td, th')].map((cell) =>
        cell.getAttribute('rowspan') ? `${cell.textContent}` : cell.textContent
      );

      return (roww.length === 3 ? roww : ['-', ...roww]).map((r) =>
        r?.padStart(3)
      );
    });

    // Every 3 rows there's a label from `list`
    // Every row there's a label from `table`
    expect(cells.join('\n')).toMatchInlineSnapshot(`
      "  1,  A, 11
        -,  B, 21
        -,  C, 31
        2,  A, 12
        -,  B, 22
        -,  C, 32
        3,  A, 13
        -,  B, 23
        -,  C, 33"
    `);
  });
});
