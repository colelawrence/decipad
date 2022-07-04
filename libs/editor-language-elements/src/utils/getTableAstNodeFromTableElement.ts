import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  SeriesType,
  TableElement,
} from '@decipad/editor-types';
import { AST, parseOneExpression } from '@decipad/computer';
import {
  astColumn,
  astNode,
  getNullReplacementValue,
  parseCell,
  parseSeriesStart,
  seriesIterator,
} from '@decipad/editor-utils';
import Fraction from '@decipad/fraction';
import { getNodeString } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { ParseError } from '../types';

export const getTableAstNodeFromTableElement = (
  _editor: MyEditor,
  table: TableElement
): { name: string; expression: AST.Table; parseErrors: ParseError[] } => {
  const [caption, headerRow, ...dataRows] = table.children;
  const parseErrors: ParseError[] = [];
  const columns = headerRow.children.map((th, columnIndex) => {
    const { cellType } = th;
    const columnName = getNodeString(th);

    const column = (() => {
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
          return seriesColumn(cellType.seriesType, content, dataRows.length);
        }
      }

      const items = dataRows.map((tr) => {
        const td = tr.children[columnIndex];
        let parsed: AST.Expression | null = null;
        if (td) {
          const text = getNodeString(td);
          parsed = parseCell(cellType, text);
          if (!parsed) {
            parseErrors.push({
              error: `Invalid ${cellType.kind}`,
              elementId: td.id,
            });
          }
        }
        if (!parsed) {
          parsed = getNullReplacementValue(cellType);
        }
        return parsed;
      });
      return astColumn(...items);
    })();

    return astNode('table-column', astNode('coldef', columnName), column);
  });

  return {
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
      astNode('literal', 'number', new Fraction(0))
    );
    return astColumn(...items);
  }
}

export function seriesColumn(
  type: SeriesType,
  source: string,
  rowCount: number
): AST.Expression {
  try {
    const { granularity } = parseSeriesStart(type, source);
    const it = seriesIterator(type, getDefined(granularity), source);
    let v = source.trim();
    const items = Array.from({ length: rowCount }, () => {
      const previous = v;
      v = it.next().value;
      return getDefined(
        parseCell(
          {
            kind: 'date',
            date: getDefined(granularity),
          },
          previous
        )
      );
    });
    return astColumn(...items);
  } catch (e) {
    const items = Array.from({ length: rowCount }, () =>
      astNode('date', 'year', 2020n)
    );
    return astColumn(...items);
  }
}
