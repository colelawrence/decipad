import { AST, Time, Interpreter } from '..';
import { pairwise, getDefined } from '../utils';
import {
  addTimeQuantity,
  cleanDate,
  getSpecificity,
  sortTimeUnits,
} from '../date';

export interface SimpleValue {
  cardinality: number;
  getData(): Interpreter.OneResult;
}

export type NonColumn = Scalar | Range | Date | TimeQuantity;
export type AnyValue = NonColumn | Column;

export type Value = SimpleValue;

export class Scalar implements SimpleValue {
  cardinality = 1;

  value: number | boolean | string;

  constructor(value: Scalar['value']) {
    this.value = value;
  }

  static fromValue(value: number | boolean | string): Scalar {
    return new Scalar(value);
  }

  getData(): Interpreter.ResultScalar {
    return this.value;
  }
}

export class Date implements SimpleValue {
  cardinality = 1;

  specificity: Time.Specificity = 'time';
  moment: number;

  constructor(date: number, specificity: Time.Specificity) {
    this.moment = cleanDate(date, specificity);
    this.specificity = specificity;
  }

  static fromDateAndSpecificity(date: number, specificity: Time.Specificity) {
    return new Date(date, specificity);
  }

  getData() {
    return this.moment;
  }

  /**
   * Dates such as month, day and year, have a start and end. getData() gets us the first millisecond of that range. getEnd gets us the last.
   */
  getEnd() {
    if (this.specificity === 'time') {
      return this.moment;
    } else {
      return (
        addTimeQuantity(
          this.moment,
          new TimeQuantity({ [this.specificity]: 1 })
        ) - 1
      );
    }
  }
}

export class TimeQuantity implements SimpleValue {
  cardinality = 1;
  timeUnits = new Map<Time.Unit, number>();

  constructor(
    timeUnits: TimeQuantity['timeUnits'] | Partial<Record<Time.Unit, number>>
  ) {
    const entries =
      timeUnits instanceof Map
        ? timeUnits.entries()
        : (Object.entries(timeUnits) as Iterable<[Time.Unit, number]>);

    const unsorted = new Map(entries);
    for (const unit of sortTimeUnits(unsorted.keys())) {
      this.timeUnits.set(unit, getDefined(unsorted.get(unit)));
    }
  }

  static fromASTArgs(args: AST.TimeQuantity['args']): TimeQuantity {
    return new TimeQuantity(new Map(pairwise<Time.Unit, number>(args)));
  }

  getData() {
    return [...this.timeUnits.entries()];
  }
}

export class Range implements SimpleValue {
  cardinality = 1;

  start: Scalar;
  end: Scalar;

  constructor({ start, end }: Pick<Range, 'start' | 'end'>) {
    this.start = start;
    this.end = end;
  }

  static fromBounds(start: Value, end: Value): Range {
    if (start instanceof Date && end instanceof Date) {
      return Range.fromBounds(
        Scalar.fromValue(start.moment),
        Scalar.fromValue(end.getEnd())
      );
    } else if (start instanceof Scalar && end instanceof Scalar) {
      return new Range({ start, end });
    } else {
      throw new Error(
        `panic: bad Range.fromBounds arguments ${start.constructor.name} and ${end.constructor.name}`
      );
    }
  }

  getData() {
    return [this.start.getData(), this.end.getData()];
  }
}

export class Column implements SimpleValue {
  values: SimpleValue[];
  valueNames: string[] | null = null;

  constructor(values: Column['values']) {
    this.values = values;
  }

  static fromValues(values: SimpleValue[]): Column {
    return new Column(values);
  }

  static fromNamedValues(values: SimpleValue[], names: string[]): Column {
    const column = Column.fromValues(values);
    column.valueNames = names;
    return column;
  }

  static fromSequence(startV: Value, endV: Value, byV: Value): Column {
    const [start, end, by] = [startV, endV, byV].map(
      (val) => val.getData() as number
    );

    const array = [];

    for (let i = start; i <= end; i += by) {
      array.push(Scalar.fromValue(i));
    }

    return Column.fromValues(array);
  }

  static fromDateSequence(startD: Date, endD: Date, by: Time.Unit): Column {
    const start = startD.getData();
    const end = endD.getEnd();
    const spec = getSpecificity(by);

    const array = [];

    for (
      let cur = start;
      cur <= end;
      cur = addTimeQuantity(cur, new TimeQuantity({ [by]: 1 }))
    ) {
      array.push(Date.fromDateAndSpecificity(cur, spec));
    }

    return Column.fromValues(array);
  }

  get rowCount() {
    return this.values.length;
  }

  get cardinality() {
    return 1 + Math.max(...this.values.map((v) => v.cardinality));
  }

  atIndex(i: number) {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }

  getData() {
    return this.values.map((v) => v.getData());
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
