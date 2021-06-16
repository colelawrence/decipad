export class TabularData {
  private data: any[][] = [];
  private _columnNames: string[] = [];

  addRow(row: any[]) {
    row = trimRow(row);
    if (this.columnCount >= 0 && row.length !== this.columnCount) {
      throw new Error('expected column count to be ' + this.columnCount);
    }
    let columnIndex = -1;
    while (this.data.length < row.length) {
      this.data.push([]);
    }
    for (const elem of row) {
      columnIndex++;
      const column = this.data[columnIndex];
      column.push(elem);
    }
  }

  setColumnNames(names: string[]) {
    names = trimRow(names).map((name) => name.toString());
    if (this.columnCount > 0 && names.length !== this.columnCount) {
      throw new Error(
        'set column names: expected column count to be ' + this.columnCount
      );
    }
    if (names.length === 0) {
      throw new Error('no columns on table');
    }
    this._columnNames = names;
  }

  get columnCount() {
    return this.data.length || this._columnNames.length;
  }

  get length(): number {
    return this.data[0]?.length || 0;
  }

  get columnNames(): string[] {
    return Array.from(this._columnNames);
  }

  column(columnName: string): any[] {
    const index = this._columnNames.indexOf(columnName);
    if (index < 0) {
      throw new Error('Unknown column named ' + columnName);
    }
    return this.data[index];
  }

  get(columnName: string, row: number): any {
    const column = this.column(columnName);
    return column[row];
  }
}

function trimRow(row: any[]): any[] {
  const result = Array.from(row);

  for (let i = result.length - 1; i >= 0; i--) {
    const cell = result[i];
    if (typeof cell === 'string' && cell.length === 0) {
      result.pop();
    } else {
      break;
    }
  }

  return result;
}
