import type { CellValueType } from '@decipad/editor-types';

export function assertCellType(
  cellType: CellValueType,
  kind: CellValueType['kind']
) {
  if (cellType.kind !== kind) {
    throw new Error(
      `Assertion Error | Expected ${kind} but got ${cellType.kind}`
    );
  }
}
