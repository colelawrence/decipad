import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  SeriesType,
  TableElement,
} from '@decipad/editor-types';
import {
  AST,
  Computer,
  isExpression,
  parseOneExpression,
} from '@decipad/computer';
import { astColumn, astNode } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import {
  getNullReplacementValue,
  inferColumn,
  parseCell,
  parseSeriesStart,
  seriesIterator,
} from '@decipad/parse';
import { toFraction } from '@decipad/fraction';
import { ParseError } from '../types';

interface GetTableAstNodeFromTableElementResult {
  id: string;
  name: string;
  expression: AST.Table;
  parseErrors: ParseError[];
}

export const getTableAstNodeFromTableElement = async (
  _editor: MyEditor,
  computer: Computer,
  table: TableElement
): Promise<GetTableAstNodeFromTableElementResult> => {
  const [caption, headerRow, ...dataRows] = table.children;
  const parseErrors: ParseError[] = [];
  const columns = await Promise.all(
    headerRow.children.map(async (th, columnIndex) => {
      const { cellType } = th;
      const columnName = getNodeString(th);

      const column = (async () => {
        if (cellType.kind === 'table-formula') {
          const formula = table.children[0].children.find(
            (child) =>
              child.type === ELEMENT_TABLE_COLUMN_FORMULA &&
              child.columnId === th.id
          );

          return formulaSourceToColumn(
            formula ? getNodeString(formula) : '',
            dataRows.length
          );
        }

        if (cellType.kind === 'series') {
          const firstDataRow = dataRows[0];
          if (firstDataRow) {
            const content = getNodeString(firstDataRow.children[columnIndex]);
            return seriesColumn(
              computer,
              cellType.seriesType,
              content,
              dataRows.length
            );
          }
        }

        const cellTexts: string[] = [];
        const cellIds: string[] = [];
        for (const tr of dataRows) {
          const td = tr.children[columnIndex];
          if (td) {
            cellTexts.push(getNodeString(td));
            cellIds.push(td.id);
          }
        }

        const columnType =
          !th.cellType || th.cellType.kind === 'anything'
            ? await inferColumn(computer, cellTexts, { userType: th.cellType })
            : th.cellType;

        const items = await Promise.all(
          cellTexts.map(async (text, index) => {
            let parsed = await parseCell(computer, columnType, text);
            if (!parsed) {
              parseErrors.push({
                error: `Invalid ${cellType.kind}`,
                elementId: cellIds[index],
              });
            }
            if (parsed instanceof Error) {
              parseErrors.push({
                error: parsed.message,
                elementId: cellIds[index],
              });
              parsed = null;
            }
            if (!parsed) {
              parsed = await getNullReplacementValue(columnType);
            }
            return parsed;
          })
        );
        return astColumn(...items);
      })();

      return astNode(
        'table-column',
        astNode('coldef', columnName),
        await column
      );
    })
  );

  return {
    id: table.id,
    name: getNodeString(caption.children[0]),
    expression: astNode('table', ...columns),
    parseErrors,
  };
};

export function formulaSourceToColumn(
  source: string,
  dataRowCount: number
): AST.Expression {
  try {
    return parseOneExpression(source);
  } catch (e) {
    const items = Array.from({ length: dataRowCount }, () =>
      astNode('literal', 'number', toFraction(0))
    );
    return astColumn(...items);
  }
}

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
