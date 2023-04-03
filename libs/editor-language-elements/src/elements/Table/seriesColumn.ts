import { SeriesType } from '@decipad/editor-types';
import { AST, Computer, IdentifiedError } from '@decipad/computer';
import { astColumn, astNode } from '@decipad/editor-utils';
import { enumerate, getDefined } from '@decipad/utils';
import { parseCell, parseSeriesStart, seriesIterator } from '@decipad/parse';
import { simpleError } from './common';

export async function seriesColumn(
  computer: Computer,
  type: SeriesType,
  firstCell: string,
  rowCount: number,
  ids: string[]
): Promise<[AST.Expression | undefined, IdentifiedError[]]> {
  try {
    const { granularity } = parseSeriesStart(type, firstCell);
    const v = firstCell.trim();

    const cells: AST.Expression[] = [];
    const errors: IdentifiedError[] = [];

    /** Push a cell or error. */
    const push = async (source: string, id: string) => {
      const cell = await parseCell(
        computer,
        { kind: 'date', date: getDefined(granularity) },
        source
      );
      if (cell instanceof Error || cell == null) {
        errors.push(simpleError(id, cell ? cell.message : 'Error'));
      } else {
        cells.push(cell);
      }
    };

    // first item -- user input
    await push(v, ids[0]);

    if (errors.length) return [undefined, errors];

    for (const [i, seriesItem] of enumerate(
      seriesIterator(type, getDefined(granularity), firstCell)
    )) {
      // subsequent items -- generated
      // eslint-disable-next-line no-await-in-loop
      await push(seriesItem, ids[i + 1]);

      if (errors.length) return [undefined, errors];
      if (i + 2 >= rowCount) break;
    }

    return [astColumn(...cells), errors];
  } catch (e) {
    const items = Array.from({ length: rowCount }, () =>
      astNode('date', 'year', 2020n)
    );
    return [
      astColumn(...items),
      [simpleError(ids[0], e instanceof Error ? e.message : 'Error')],
    ];
  }
}
