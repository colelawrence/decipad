import type { Value } from '@decipad/language-interfaces';
import { RuntimeError } from '../RuntimeError';

export class Row implements Value.Value {
  cells: Value.Value[];
  cellNames: string[];

  constructor(values: Value.Value[], cellNames: string[]) {
    this.cells = values;
    this.cellNames = cellNames;
  }

  static fromNamedCells(cells: Value.Value[], cellNames: string[]) {
    return new Row(cells, cellNames);
  }

  getCell(name: string): Value.Value {
    const index = this.cellNames.indexOf(name);
    if (index < 0 || index >= this.cells.length) {
      throw new RuntimeError(`Missing cell ${name}`);
    }
    return this.cells[index];
  }

  async getData() {
    return Promise.all(this.cells.map(async (v) => v.getData()));
  }
}
