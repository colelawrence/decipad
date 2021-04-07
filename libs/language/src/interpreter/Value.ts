import { DateSpecificity, cleanDate } from '../date';

export interface SimpleValue {
  rowCount: number | null;

  withRowCount(rowCount: number): Column;
  asScalar(): Scalar;

  getData(): Interpreter.OneResult;
}

export type Value = SimpleValue | Table;

export class Scalar implements SimpleValue {
  rowCount = null;
  value: number | boolean | string;

  static fromValue(value: number | boolean | string): Scalar {
    const ret = new Scalar();
    ret.value = value;
    return ret;
  }

  withRowCount(rowCount: number): Column {
    return Column.fromValues(new Array(rowCount).fill(this));
  }

  asScalar() {
    return this;
  }

  getData() {
    return this.value;
  }
}

export class Date implements SimpleValue {
  rowCount = null;

  timeRange: Range;

  static fromDateAndSpecificity(
    date: number,
    specificity: DateSpecificity
  ): Date {
    const [start, end] = cleanDate(date, specificity);
    const d = new Date();
    d.timeRange = Range.fromBounds(
      Scalar.fromValue(start),
      Scalar.fromValue(end)
    );
    return d;
  }

  withRowCount(rowCount: number) {
    return Column.fromValues(new Array(rowCount).fill(this));
  }

  asScalar(): Scalar {
    throw new Error('panic: could not turn Date into Scalar');
  }

  getData() {
    return this.timeRange.getData();
  }
}

export class Range implements SimpleValue {
  rowCount = null;
  start: Scalar;
  end: Scalar;

  static fromBounds(start: Scalar, end: Scalar) {
    const range = new Range();
    range.start = start;
    range.end = end;
    return range;
  }

  getData() {
    return [this.start.getData() as number, this.end.getData() as number];
  }

  asScalar(): Scalar {
    throw new Error('panic: Range cannot be turned into a single value');
  }

  withRowCount(): Column {
    throw new Error('not implemented TODO');
  }
}

export class Column implements SimpleValue {
  rangeOf = null;
  values: (Scalar | Range | Date)[];

  static fromValues(values: (Scalar | Range | Date)[]): Column {
    const column = new Column();
    column.values = values;
    return column;
  }

  get rowCount() {
    return this.values.length;
  }

  withRowCount(rowCount: number) {
    if (rowCount === this.rowCount) {
      return this;
    } else {
      throw new Error(
        `panic: bad row count ${this.rowCount} incompatible with desired row count ${rowCount}`
      );
    }
  }

  atIndex(i: number) {
    if (i < this.values.length) {
      return this.values[i];
    } else {
      throw new Error(`panic: index ${i} out of bounds`);
    }
  }

  getData() {
    return (this.values as any).map((v: Scalar | Range) => v.getData());
  }

  asScalar() {
    if (this.rowCount === 1) {
      return this.values[0] as Scalar;
    } else {
      throw new Error('panic: expected column of 1');
    }
  }
}

export class Table {
  constructor(public columns: Map<string, Column> = new Map()) {}

  getData(): Map<string, (number | boolean)[]> {
    const out = new Map();
    for (const [key, value] of this.columns) {
      out.set(key, value.getData());
    }
    return out;
  }
}

export const fromJS = (thing: number | number[]): Scalar | Column => {
  if (typeof thing === 'number') {
    return Scalar.fromValue(thing);
  } else {
    return Column.fromValues(thing.map((t) => fromJS(t).asScalar()));
  }
};
