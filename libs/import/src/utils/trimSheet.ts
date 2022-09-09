import { Sheet, SpreadsheetColumn, SpreadsheetValue } from '../types';

interface NeedsTrimming {
  trimTopRowCount: number;
  trimBottomRowCount: number;
  finalRowCount: number;
}

const isEmpty = (cell: SpreadsheetValue): boolean =>
  typeof cell === 'string' && cell.trim().length === 0;

const columnNeedsTrimming = (column: SpreadsheetColumn): NeedsTrimming => {
  let alreadyHasData = false;
  let trimTopRowCount = 0;
  let trimBottomRowCount = 0;
  for (const cell of column) {
    const empty = isEmpty(cell);
    if (alreadyHasData) {
      if (empty) {
        trimBottomRowCount += 1;
      } else {
        trimBottomRowCount = 0;
      }
    } else if (empty) {
      trimTopRowCount += 1;
    } else {
      trimBottomRowCount = 0;
    }
    if (!empty) {
      alreadyHasData = true;
    }
  }
  return {
    trimTopRowCount,
    trimBottomRowCount,
    finalRowCount: column.length - trimTopRowCount - trimBottomRowCount,
  };
};

const trimColumn = (
  column: SpreadsheetColumn,
  trimRowCount: number,
  trimBottomRowCount: number,
  finalRowCount: number
): SpreadsheetColumn => {
  let trimmed = column.slice(trimRowCount);
  if (trimBottomRowCount > 0) {
    trimmed = trimmed.slice(0, -trimBottomRowCount);
  }
  const needsFillingAtTheBottom = finalRowCount - trimmed.length;
  if (needsFillingAtTheBottom) {
    for (let i = 0; i < needsFillingAtTheBottom; i += 1) {
      trimmed.push('');
    }
  }
  return trimmed;
};

interface TrimmerOptions {
  finalTrimTopRowCount: number;
  finalTrimBottomRowCount: number;
  finalRowCount: number;
}

type Trimmer = (column: SpreadsheetColumn) => SpreadsheetColumn;

const createTrimmer = ({
  finalTrimTopRowCount,
  finalTrimBottomRowCount,
  finalRowCount,
}: TrimmerOptions): Trimmer => {
  return (column) =>
    trimColumn(
      column,
      finalTrimTopRowCount,
      finalTrimBottomRowCount,
      finalRowCount
    );
};

export const trimSheet = (sheet: Sheet): Sheet => {
  const trimmingNeeds = sheet.values.map(columnNeedsTrimming);
  const finalTrimTopRowCount = Math.min(
    ...trimmingNeeds.map((tn) => tn.trimTopRowCount)
  );
  const finalTrimBottomRowCount = Math.min(
    ...trimmingNeeds.map((tn) => tn.trimBottomRowCount)
  );
  const finalRowCount = Math.max(
    ...trimmingNeeds.map((tn) => tn.finalRowCount)
  );
  const trimmer = createTrimmer({
    finalTrimTopRowCount,
    finalTrimBottomRowCount,
    finalRowCount,
  });
  return {
    values: sheet.values.map(trimmer),
  };
};
