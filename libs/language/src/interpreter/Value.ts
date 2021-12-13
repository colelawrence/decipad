import Fraction from '@decipad/fraction';
import { AST, Time, Interpreter } from '..';
import { pairwise, getDefined } from '../utils';
import {
  addTimeQuantity,
  cleanDate,
  getSpecificity,
  sortTimeUnits,
} from '../date';
import { Unknown } from './Unknown';

export interface Value {
  getData(): Interpreter.OneResult;
}

export const UnknownValue: Value = {
  getData() {
    return Unknown;
  },
};

export type NonColumn =
  | typeof UnknownValue
  | FractionValue
  | StringValue
  | BooleanValue
  | Range
  | Date
  | TimeQuantity;
export type AnyValue = NonColumn | Column;

export class Scalar {
  static fromValue(
    value: number | bigint | Fraction | boolean | string | symbol
  ): NonColumn {
    if (value instanceof Fraction) {
      return FractionValue.fromValue(value);
    }
    const t = typeof value;
    if (t === 'number' || t === 'bigint') {
      return FractionValue.fromValue(value as number | bigint);
    }
    if (t === 'boolean') {
      return BooleanValue.fromValue(value as boolean);
    }
    return StringValue.fromValue(value as string);
  }
}

export class FractionValue implements Value {
  readonly value: Fraction;

  constructor(varValue: number | bigint | Fraction) {
    const t = typeof varValue;
    if (t === 'number' || t === 'bigint') {
      if (Number.isNaN(varValue)) {
        throw new TypeError('not a number');
      }
      this.value = new Fraction(varValue as number | bigint);
    } else {
      this.value = varValue as Fraction;
    }
  }

  getData() {
    return this.value;
  }

  static fromValue(value: number | bigint | Fraction): FractionValue {
    return new FractionValue(value);
  }
}

export class StringValue implements Value {
  value: string;
  constructor(value: string) {
    this.value = value;
  }

  static fromValue(value: string): StringValue {
    return new StringValue(value);
  }

  getData() {
    return this.value;
  }
}

export class BooleanValue implements Value {
  value: boolean;
  constructor(value: boolean) {
    this.value = value;
  }

  static fromValue(value: boolean): BooleanValue {
    return new BooleanValue(value);
  }

  getData() {
    return this.value;
  }
}

export class Date implements Value {
  specificity: Time.Specificity = 'time';
  moment: bigint;

  constructor(date: bigint | number, specificity: Time.Specificity) {
    this.moment = cleanDate(date, specificity);
    this.specificity = specificity;
  }

  static fromDateAndSpecificity(date: bigint, specificity: Time.Specificity) {
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
        ) - 1n
      );
    }
  }
}

export class TimeQuantity implements Value {
  timeUnits = new Map<Time.Unit, bigint>();
  timeUnitsDiff = new Map<Time.Unit, bigint>();

  constructor(
    timeUnits: TimeQuantity['timeUnits'] | Partial<Record<Time.Unit, bigint>>,
    timeUnitsDiff?:
      | TimeQuantity['timeUnits']
      | Partial<Record<Time.Unit, bigint>>
  ) {
    {
      const entries =
        timeUnits instanceof Map
          ? timeUnits.entries()
          : (Object.entries(timeUnits) as Iterable<[Time.Unit, bigint]>);

      const unsorted = new Map(entries);
      for (const unit of sortTimeUnits(unsorted.keys())) {
        this.timeUnits.set(unit, getDefined(unsorted.get(unit)));
      }
    }

    if (timeUnitsDiff) {
      const entries =
        timeUnitsDiff instanceof Map
          ? timeUnitsDiff.entries()
          : (Object.entries(timeUnitsDiff) as Iterable<[Time.Unit, bigint]>);

      const unsorted = new Map(entries);
      for (const unit of sortTimeUnits(unsorted.keys())) {
        this.timeUnitsDiff.set(unit, getDefined(unsorted.get(unit)));
      }
    }
  }

  static fromASTArgs(args: AST.TimeQuantity['args']): TimeQuantity {
    return new TimeQuantity(new Map(pairwise<Time.Unit, bigint>(args)));
  }

  getData() {
    return Array.from(this.timeUnits.entries());
  }
}

export class Range implements Value {
  start: Value;
  end: Value;

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
    } else if (start instanceof FractionValue && end instanceof FractionValue) {
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

export class Column implements Value {
  readonly values: Value[];
  valueNames: string[] | null = null;

  constructor(values: Column['values']) {
    this.values = values;
  }

  static fromValues(values: Value[]): Column {
    return new Column(values);
  }

  static fromNamedValues(values: Value[], names: string[] | null): Column {
    const column = Column.fromValues(values);
    column.valueNames = names;
    return column;
  }

  static fromSequence(startV: Value, endV: Value, byV: Value): Column {
    const [start, end, by] = [startV, endV, byV].map(
      (val) => val.getData() as Fraction
    );

    const array = [];

    for (let i = start; i.compare(end) <= 0; i = i.add(by)) {
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

  atIndex(i: number) {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }

  getData(): Interpreter.OneResult[] {
    return this.values.map((v) => v.getData());
  }
}

type FromJSOneArg = Interpreter.OneResult | number;
type FromJSArg = FromJSOneArg | FromJSOneArg[];

export const fromJS = (thing: FromJSArg): AnyValue => {
  // TODO this doesn't distinguish Range/Date from Column, and it can't possibly do it!
  if (thing == null) {
    throw new TypeError('result cannot be null');
  }
  if (!Array.isArray(thing)) {
    return Scalar.fromValue(thing);
  } else {
    return Column.fromValues(thing.map((t) => fromJS(t)));
  }
};
