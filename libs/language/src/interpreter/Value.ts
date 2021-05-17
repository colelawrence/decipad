import { pairwise } from '../utils';
import { DateSpecificity, cleanDate } from '../date';

export interface SimpleValue {
  rowCount: number | null;
  withRowCount(rowCount: number): Column;
  asScalar(): Scalar;
  cardinality: number;
  getData(): Interpreter.OneResult;
}

export type AnyValue = Scalar | Range | Date | TimeQuantity | Column;

export type Value = SimpleValue;

export class Scalar implements SimpleValue {
  cardinality = 1;
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

  getData(): Interpreter.ResultScalar {
    return this.value;
  }
}

export class Date implements SimpleValue {
  cardinality = 1;
  rowCount = null;

  specificity: DateSpecificity = 'time';
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
    d.specificity = specificity;
    return d;
  }

  withRowCount(rowCount: number) {
    return Column.fromValues(new Array(rowCount).fill(this));
  }

  asScalar(): Scalar {
    throw new Error('panic: could not turn Date into Scalar');
  }

  getData() {
    return this.timeRange.getData() as number[];
  }
}

export class TimeQuantity implements SimpleValue {
  cardinality = 1;
  rowCount = null;

  timeUnits: Map<AST.TimeUnit, number>;

  static fromASTArgs(args: AST.TimeQuantity['args']): TimeQuantity {
    const tq = new TimeQuantity();
    tq.timeUnits = new Map(pairwise<AST.TimeUnit, number>(args));
    return tq;
  }

  withRowCount(rowCount: number) {
    return Column.fromValues(new Array(rowCount).fill(this));
  }

  asScalar(): Scalar {
    throw new Error('panic: could not turn TimeQuantity into Scalar');
  }

  getData() {
    return [...this.timeUnits.entries()];
  }
}

export class Range implements SimpleValue {
  cardinality = 1;
  rowCount = null;
  start: Scalar;
  end: Scalar;

  static fromBounds(start: Value, end: Value): Range {
    if (start instanceof Date && end instanceof Date) {
      const startStart = start.timeRange.getData()[0];
      const endEnd = end.timeRange.getData()[1];

      return Range.fromBounds(
        Scalar.fromValue(startStart),
        Scalar.fromValue(endEnd)
      );
    } else if (start instanceof Scalar && end instanceof Scalar) {
      const range = new Range();

      range.start = start;
      range.end = end;

      return range;
    } else {
      throw new Error(
        `panic: bad Range.fromBounds arguments ${start?.constructor?.name} and ${end?.constructor?.name}`
      );
    }
  }

  getData() {
    return [this.start.getData(), this.end.getData()];
  }

  asScalar(): Scalar {
    throw new Error('panic: Range cannot be turned into a single value');
  }

  withRowCount(): Column {
    throw new Error('not implemented TODO');
  }
}

export class Column implements SimpleValue {
  values: SimpleValue[];
  valueNames: string[] | null = null;

  static fromValues(values: SimpleValue[]): Column {
    const column = new Column();
    column.values = values;
    return column;
  }

  static fromNamedValues(values: SimpleValue[], names: string[]): Column {
    const column = Column.fromValues(values);
    column.valueNames = names;
    return column;
  }

  get rowCount() {
    return this.values.length;
  }

  get cardinality() {
    return 1 + Math.max(...this.values.map((v) => v.cardinality));
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
    return this.values.map((v) => v.getData());
  }

  asScalar() {
    if (this.rowCount === 1) {
      return this.values[0].asScalar();
    } else {
      throw new Error('panic: expected column of 1');
    }
  }
}

export const fromJS = (thing: Interpreter.OneResult): Scalar | Column => {
  // TODO this doesn't distinguish Range/Date from Column, and it can't possibly do it!
  if (!Array.isArray(thing)) {
    return Scalar.fromValue(thing);
  } else {
    return Column.fromValues(thing.map((t) => fromJS(t)));
  }
};
