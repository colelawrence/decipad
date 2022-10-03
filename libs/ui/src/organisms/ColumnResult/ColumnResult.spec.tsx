import { FC } from 'react';
import {
  render,
  getAllByRole as getAllDescendantsByRole,
} from '@testing-library/react';
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

it('renders a single column table', async () => {
  const { getAllByRole } = render(
    <ColumnResult {...await runCode('[1, 2, 3]')} />
  );

  const rows = getAllByRole('row');
  const cells = getAllByRole('cell');

  expect(rows).toHaveLength(3);
  expect(cells).toHaveLength(3);
  cells.forEach((cell) => expect(cell).toBeVisible());
});

it('renders padding on cells contents', async () => {
  const { getByText } = render(
    <ColumnResult {...await runCode('[1, 2, 3]')} />
  );

  const cellPaddings = ['1', '2', '3']
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
      H2 = [1, 2, 3]
    }
    list = [1, 2, 3]
    list + table.H2
  `;
  const indexLabels = new Map([['table', ['A', 'B', 'C']]]);

  it('renders a bidimensional column', async () => {
    const { container } = render(<ColumnResult {...await runCode(code)} />, {
      wrapper: withResultContextWrapper({ indexLabels }),
    });

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(dimensions).toHaveLength(3);
  });

  it('renders labelsz', async () => {
    const { container, getAllByRole } = render(
      <ColumnResult {...await runCode(code)} />,
      {
        wrapper: withResultContextWrapper({ indexLabels }),
      }
    );

    const topLevelTable = container.querySelector('table')!;
    const cells = getAllByRole(
      (role, element) =>
        role === 'cell' &&
        element?.parentElement?.closest('table') === topLevelTable
    );

    expect(cells).toHaveLength(3);

    expect(cells.map((cell) => getAllDescendantsByRole(cell, 'cell'))).toEqual(
      Array(3).fill(
        expect.objectContaining({
          0: expect.objectContaining({ textContent: 'A' }),
          2: expect.objectContaining({ textContent: 'B' }),
          4: expect.objectContaining({ textContent: 'C' }),
        })
      )
    );
  });

  it('renders left padding on cells of an unlabelled dimension containing another dimension', async () => {
    const { container } = render(<ColumnResult {...await runCode(code)} />, {
      wrapper: withResultContextWrapper({ indexLabels }),
    });

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(
      dimensions.map(
        (cell) => findParentWithStyle(cell, 'paddingLeft')?.paddingLeft
      )
    ).toEqual(Array(3).fill(expect.stringMatching(/.+/)));
    expect(
      dimensions.map((cell) => findParentWithStyle(cell, 'padding')?.padding)
    ).toEqual([undefined, undefined, undefined]);
  });

  it('renders no padding on cells of a labelled dimension containing another dimension', async () => {
    const newCode = `
      table = {
        H1 = ["A", "B", "C"]
        H2 = [1, 2, 3]
      }
      list = [1, 2, 3]
      table.H2 + list
    `;
    const { container } = render(<ColumnResult {...await runCode(newCode)} />, {
      wrapper: withResultContextWrapper({ indexLabels }),
    });

    const dimensions = getAllDescendantsByRole(
      container.querySelector('table')!,
      'table'
    );

    expect(
      dimensions.map(
        (cell) => findParentWithStyle(cell, 'paddingLeft')?.paddingLeft
      )
    ).toEqual([undefined, undefined, undefined]);
    expect(
      dimensions.map((cell) => findParentWithStyle(cell, 'padding')?.padding)
    ).toEqual([undefined, undefined, undefined]);
  });
});
