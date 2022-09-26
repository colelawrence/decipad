import { SeriesType } from '@decipad/editor-types';
import { AST, Computer, isExpression } from '@decipad/computer';
import { astColumn, astNode } from '@decipad/editor-utils';
import { getDefined } from '@decipad/utils';
import { parseCell, parseSeriesStart, seriesIterator } from '@decipad/parse';

export async function seriesColumn(
  computer: Computer,
  type: SeriesType,
  source: string,
  rowCount: number
): Promise<AST.Expression> {
  try {
    const { granularity } = parseSeriesStart(type, source);
    const it = seriesIterator(type, getDefined(granularity), source);
    let v = source.trim();
    const items = (
      await Promise.all(
        Array.from({ length: rowCount }, async () => {
          const previous = v;
          v = it.next().value;
          return getDefined(
            await parseCell(
              computer,
              {
                kind: 'date',
                date: getDefined(granularity),
              },
              previous
            )
          );
        })
      )
    ).filter(isExpression);
    return astColumn(...items);
  } catch (e) {
    const items = Array.from({ length: rowCount }, () =>
      astNode('date', 'year', 2020n)
    );
    return astColumn(...items);
  }
}
