import { TableCellType } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { toFraction } from '@decipad/fraction';

export function formatCell(
  computer: Computer,
  cellType: TableCellType,
  text: string
): string {
  if (cellType.kind !== 'number' || cellType.unit == null) {
    return text;
  }

  const n = Number(text);
  const f = toFraction(Number.isNaN(n) ? 0 : n);
  return `${f.toString()} ${computer.formatUnit(cellType.unit, f)}`;
}
