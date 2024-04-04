import type { TableCellType } from '@decipad/editor-types';
import { N } from '@decipad/number';
import { formatUnit } from '@decipad/format';

export function formatCell(cellType: TableCellType, text: string): string {
  if (cellType.kind !== 'number' || cellType.unit == null) {
    return text;
  }

  const n = Number(text);
  const f = N(n);
  return `${f.toString()} ${formatUnit('en-US', cellType.unit, f)}`;
}
