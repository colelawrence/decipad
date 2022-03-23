import { TableCellType } from '@decipad/editor-types';
import Fraction from '@decipad/fraction';
import { deserializeUnit, stringifyUnits } from '@decipad/language';

export function formatCell(cellType: TableCellType, text: string): string {
  if (cellType.kind !== 'number' || cellType.unit == null) {
    return text;
  }

  const n = Number(text);
  const f = new Fraction(Number.isNaN(n) ? 0 : n);
  return `${f.toString()} ${stringifyUnits(deserializeUnit(cellType.unit), f)}`;
}
