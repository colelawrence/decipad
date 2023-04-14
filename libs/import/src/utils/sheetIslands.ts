/* eslint-disable no-param-reassign */
import { Result } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { dequal } from 'dequal';
import { getDataRangeUrlFromSheetAndIslands } from '../providers/gsheets/getDataRangeUrlFromSheet';
import { ImportResult } from '../types';
import { matrix } from './matrix';

interface VisitStackElement {
  col: number;
  row: number;
}

type VisitStack = Array<VisitStackElement>;

const neighbourDiffs = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

export interface Island {
  sheetName: string;
  firstCol: number;
  firstRow: number;
  lastCol: number;
  lastRow: number;
}

const makeIsland = (sheetName: string, col: number, row: number): Island => {
  return {
    sheetName,
    firstCol: col,
    lastCol: col,
    firstRow: row,
    lastRow: row,
  };
};

const islandExtension = (
  island: Island,
  newCol: number,
  newRow: number
): Island => ({
  ...island,
  firstCol: Math.min(newCol, island.firstCol),
  lastCol: Math.max(newCol, island.lastCol),
  firstRow: Math.min(newRow, island.firstRow),
  lastRow: Math.max(newRow, island.lastRow),
});

const islandToResult =
  (sheet: Result.Result<'table'>) =>
  (island: Island): Result.Result => ({
    type: {
      ...sheet.type,
      columnNames: sheet.type.columnNames.slice(
        island.firstCol,
        island.lastCol + 1
      ),
      columnTypes: sheet.type.columnTypes.slice(
        island.firstCol,
        island.lastCol + 1
      ),
    },
    value: sheet.value
      .filter(
        (_, columnIndex) =>
          columnIndex >= island.firstCol && columnIndex <= island.lastCol
      )
      .map((column) => column.slice(island.firstRow, island.lastRow + 1)),
  });

const partition = (
  sheetName: string,
  imported: ImportResult
): ImportResult[] => {
  if (imported.result?.type.kind !== 'table') {
    return [];
  }
  const sheet = imported.result as Result.Result<'table'>;
  const columnCount = sheet.type.columnTypes.length;
  const rowCount = Math.max(...sheet.value.map((col) => col.length));
  const visited = matrix(columnCount, rowCount, false);

  const { value: sheetColumns } = sheet;

  const islands = new Set<Island>();

  const extendIsland = (island: Island, colIndex: number, rowIndex: number) => {
    const extension = islandExtension(island, colIndex, rowIndex);
    if (dequal(island, extension)) {
      return island;
    }
    return extension;
  };

  const withinRange = (colIndex: number, rowIndex: number): boolean => {
    return (
      colIndex >= 0 &&
      colIndex < columnCount &&
      rowIndex >= 0 &&
      rowIndex < rowCount
    );
  };

  const hasValue = (col: number, row: number): boolean => {
    const value = sheetColumns[col][row];
    if (value == null) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (typeof value === 'number') {
      return true;
    }
    return false;
  };

  const pushNeighbourCells = (col: number, row: number, stack: VisitStack) => {
    for (const diff of neighbourDiffs) {
      const nextColIndex = col + diff[0];
      const nextRowIndex = row + diff[1];
      if (
        withinRange(nextColIndex, nextRowIndex) &&
        !visited[nextColIndex][nextRowIndex] &&
        hasValue(nextColIndex, nextRowIndex)
      ) {
        stack.push({
          col: nextColIndex,
          row: nextRowIndex,
        });
      }
    }
  };

  const exploreIsland = (
    subSheetName: string,
    _col: number,
    _row: number
  ): Island => {
    let island = makeIsland(subSheetName, _col, _row);
    const stack: Array<VisitStackElement> = [{ col: _col, row: _row }];
    do {
      const { col, row } = getDefined(stack.pop());
      if (!visited[col][row] && hasValue(col, row)) {
        visited[col][row] = true;
        island = extendIsland(island, col, row);
        pushNeighbourCells(col, row, stack);
      }
    } while (stack.length > 0);
    return island;
  };

  for (let col = 0; col < columnCount; col += 1) {
    for (let row = 0; row < rowCount; row += 1) {
      if (!visited[col][row] && hasValue(col, row)) {
        const island = exploreIsland(sheetName, col, row);
        islands.add(island);
      }
    }
  }

  const newResults = [...islands].map((island) => {
    const result = islandToResult(sheet)(island);
    const meta = getDefined(imported.meta);
    const { sheetId } = meta;
    return {
      result,
      meta: {
        ...meta,
        sourceUrl: getDataRangeUrlFromSheetAndIslands(
          getDefined(sheetId),
          island.sheetName,
          getDefined(meta.sourceMeta),
          island
        ),
      },
      loading: false,
    };
  });

  return newResults;
};

export const findAllIslands = (
  sheetName: string,
  sheet: ImportResult
): ImportResult[] => partition(sheetName, sheet);
