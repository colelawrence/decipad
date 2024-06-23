import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';

import { runCode } from '../../../test-utils';
import { ColumnResult } from './ColumnResult';
import { timeout } from '@decipad/utils';
import { useComputer } from '@decipad/editor-hooks';
import { parseBlockOrThrow } from '@decipad/computer';
import { FC, useEffect } from 'react';
import { Result, SerializedTypes } from '@decipad/language-interfaces';

describe.sequential('ColumnResult', () => {
  it('renders a single column table', async () => {
    const { getAllByRole } = render(
      <ColumnResult
        {...((await runCode('[1, 2, 3]', {
          doNotMaterialiseResults: true,
        })) as any)}
      />
    );

    // time to stream columns
    await act(() => timeout(1000));

    const rows = getAllByRole('row');
    const cells = getAllByRole('cell');

    expect(rows).toHaveLength(4);
    expect(cells).toHaveLength(6);
    cells.forEach((cell) => expect(cell).toBeVisible());
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it('renders padding on cells contents', async () => {
    const { getByText } = render(
      <ColumnResult {...((await runCode('[10, 20, 30]')) as any)} />
    );

    // time to stream columns
    await act(() => timeout(1000));

    const cellPaddings = ['10', '20', '30']
      .map((text) => getByText(text))
      .map((cell) => findParentWithStyle(cell, 'paddingLeft')!.paddingLeft);
    expect(cellPaddings).toEqual([
      expect.stringMatching(/.+/),
      expect.stringMatching(/.+/),
      expect.stringMatching(/.+/),
    ]);
  });

  describe.sequential('dimensions', () => {
    const code = [
      `table = {
        H1 = ["A", "B", "C"]
        H2 = [10, 20, 30]
      }`,
      `list = [1, 2, 3]`,
      `list + table.H2`,
    ];

    // eslint-disable-next-line jest/no-disabled-tests
    it('renders a bidimensional column', async () => {
      const Wrapper: FC = () => {
        const computer = useComputer();

        useEffect(() => {
          computer.pushComputeDelta({
            program: {
              upsert: code.map((line, index) => ({
                type: 'identified-block',
                id: `block-id-${index + 1}`,
                block: parseBlockOrThrow(line, `block-id-${index + 1}`),
              })),
            },
          });
        }, [computer]);

        const result = computer.getBlockIdResult$.use('block-id-3');
        return result?.result ? (
          <ColumnResult
            type={result.result.type as SerializedTypes.Column}
            value={result.result.value as Result.ResultGenerator}
          />
        ) : null;
      };

      const { container } = render(<Wrapper />);

      // time to stream columns
      await act(() => timeout(1000));

      const rows = [...container.querySelectorAll('tbody > tr')];

      expect(rows).toHaveLength(9);

      const cells = rows.map((row) => {
        const roww = [...row.querySelectorAll('td, th')].map((cell) =>
          cell.getAttribute('rowspan')
            ? `${cell.textContent}`
            : cell.textContent
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
});
