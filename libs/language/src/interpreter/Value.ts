/* eslint-disable no-underscore-dangle */
import Fraction from '@decipad/fraction';
import { unzip } from '@decipad/utils';
import { Time, Interpreter } from '..';
import {
  AnyMapping,
  anyMappingToMap,
  filterUnzipped,
  getDefined,
  getInstanceof,
} from '../utils';
import {
  addTimeQuantity,
  TimeQuantity,
  cleanDate,
  getSpecificity,
} from '../date';
import { compare } from './compare-values';
import { Unknown } from './Unknown';
import { RuntimeError } from '.';

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
  | DateValue
  | Table
  | Row;
export type AnyValue = NonColumn | Column;

const MAX_ITERATIONS = 10_000; // Failsafe

export class Scalar {
  static fromValue(
    value: number | bigint | Fraction | boolean | string | symbol | Date
  ): NonColumn {
    if (value instanceof Date) {
      return DateValue.fromDateAndSpecificity(value.getTime(), 'millisecond');
    }
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

class DateValue implements Value {
  specificity: Time.Specificity;
  moment: bigint;

  constructor(moment: bigint, specificity: Time.Specificity) {
    this.moment = moment;
    this.specificity = specificity;
  }

  static fromDateAndSpecificity(
    date: bigint | number,
    specificity: Time.Specificity
  ) {
    return new DateValue(cleanDate(date, specificity), specificity);
  }

  getData() {
    return this.moment;
  }

  /**
   * Dates such as month, day and year, have a start and end. getData() gets us the first millisecond of that range. getEnd gets us the last.
   */
  getEnd() {
    return (
      addTimeQuantity(
        this.moment,
        new TimeQuantity({ [this.specificity]: 1 })
      ) - 1n
    );
  }

  getEndDate() {
    const moment = this.getEnd();
    return new DateValue(moment, this.specificity);
  }
}

export { DateValue as Date };

export class Range implements Value {
  start: Value;
  end: Value;

  constructor({ start, end }: Pick<Range, 'start' | 'end'>) {
    this.start = start;
    this.end = end;
  }

  static fromBounds(start: Value, end: Value): Range {
    if (start instanceof DateValue && end instanceof DateValue) {
      return new Range({
        start,
        end: end.getEndDate(),
      });
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

export type SliceRange = [start: number, end: number];
export type SlicesMap = SliceRange[];

export class Column implements Value {
  readonly _values: Value[];

  constructor(values: Column['values']) {
    this._values = values;
  }

  static fromValues(values: Value[]): Column {
    return new Column(values);
  }

  static fromSequence(startV: Value, endV: Value, byV?: Value): Column {
    const [start, end] = [startV, endV].map((val) => val.getData() as Fraction);

    const by = byV
      ? (byV.getData() as Fraction)
      : start.compare(end) < 0
      ? new Fraction(1)
      : new Fraction(-1);

    const array = [];
    let iterations = 0;

    // helper to allow decreasing sequences
    const cmpFn = (s: Fraction, e: Fraction, i: Fraction) => {
      return s.compare(e) < 0 ? i.compare(e) <= 0 : i.compare(e) >= 0;
    };

    for (let i = start; cmpFn(start, end, i); i = i.add(by)) {
      if (++iterations > MAX_ITERATIONS) {
        throw new RuntimeError(
          `A maximum number of ${MAX_ITERATIONS} has been reached in sequence. Check for an unbound sequence in your code.`
        );
      }
      array.push(Scalar.fromValue(i));
    }

    return Column.fromValues(array);
  }

  static fromDateSequence(
    startD: DateValue,
    endD: DateValue,
    by: Time.Unit
  ): Column {
    let start = startD.getData();
    let end = endD.getData();
    if (end >= start) {
      end = endD.getEnd();
    } else {
      start = startD.getEnd();
    }

    const spec = getSpecificity(by);

    const array = [];

    // helper to allow decreasing date sequences
    const cmpFn = (s: bigint, e: bigint, i: bigint) => {
      return s < e ? i <= e : i >= e;
    };

    const signal = start < end ? 1 : -1;
    const add = new TimeQuantity({ [by]: 1 * signal });
    for (
      let cur = start;
      cmpFn(start, end, cur);
      cur = addTimeQuantity(cur, add)
    ) {
      array.push(DateValue.fromDateAndSpecificity(cur, spec));
    }

    return Column.fromValues(array);
  }

  get values() {
    return this._values;
  }

  get rowCount() {
    return this.values.length;
  }

  atIndex(i: number) {
    return getDefined(this.values[i], `index ${i} out of bounds`);
  }

  getData(): Interpreter.OneResult[] {
    return this.values.map((value) => value.getData());
  }

  filterMap(fn: (value: Value, index?: number) => boolean): boolean[] {
    return this.values.map(fn);
  }

  sortMap(): number[] {
    const unsortedIndexes = Array.from({ length: this.rowCount }, (_, i) => i);
    return unsortedIndexes.sort((aIndex, bIndex) => {
      return compare(this.values[aIndex], this.values[bIndex]);
    });
  }

  sort(): Column {
    return MappedColumn.fromColumnAndMap(this, this.sortMap());
  }

  unique(): Column {
    const sorted = this.sort();
    const slices = sorted.contiguousSlices().map(([index]) => index);
    return sorted.applyMap(slices);
  }

  reverseMap() {
    const length = this.rowCount;
    return Array.from({ length: this.values.length }, (_, i) => length - i - 1);
  }

  reverse(): Column {
    return MappedColumn.fromColumnAndMap(this, this.reverseMap());
  }

  slice(begin: number, end: number): ColumnSlice {
    return ColumnSlice.fromColumnAndRange(this, begin, end);
  }

  applyMap(map: number[]): Column {
    return MappedColumn.fromColumnAndMap(this, map);
  }

  applyFilterMap(map: boolean[]): Column {
    return FilteredColumn.fromColumnAndMap(this, map);
  }

  contiguousSlices(): SlicesMap {
    const slices: SlicesMap = [];
    let lastValue: undefined | Value;
    let nextSliceBeginsAt = 0;
    this.values.forEach((currentValue, index) => {
      if (lastValue && compare(lastValue, currentValue) !== 0) {
        // at the beginning of a new slice
        slices.push([nextSliceBeginsAt, index - 1]);
        nextSliceBeginsAt = index;
      }
      lastValue = currentValue;
    });

    if (nextSliceBeginsAt <= this.values.length - 1) {
      slices.push([nextSliceBeginsAt, this.values.length - 1]);
    }

    return slices;
  }
}

export class ColumnSlice extends Column {
  begin: number;
  end: number;

  constructor(values: Column['values'], begin: number, end: number) {
    super(values);
    this.begin = begin;
    this.end = end;
  }

  static fromColumnAndRange(column: Column, begin: number, end: number) {
    return new ColumnSlice(column.values, begin, end);
  }

  get values(): Value[] {
    return this._values.slice(this.begin, this.end + 1);
  }
}

export class MappedColumn extends Column {
  private map: number[];

  constructor(values: Column['values'], map: number[]) {
    super(values);
    this.map = map;
  }

  get values(): Value[] {
    return this.map.map((index) => this._values[index]);
  }

  static fromColumnAndMap(column: Column, map: number[]): MappedColumn {
    return new MappedColumn(column.values, map);
  }
}

export class FilteredColumn extends Column {
  private map: boolean[];

  constructor(values: Column['values'], map: boolean[]) {
    super(values);
    this.map = map;
  }

  get values(): Value[] {
    const { map } = this;
    let cursor = -1;
    return Array.from({ length: this.map.filter(Boolean).length }, () => {
      cursor += 1;
      while (!map[cursor]) {
        cursor += 1;
      }
      return this._values[cursor];
    });
  }

  static fromColumnAndMap(column: Column, map: boolean[]): FilteredColumn {
    return new FilteredColumn(column.values, map);
  }
}

export class Table implements Value {
  columns: Column[];
  columnNames: string[];

  constructor(columns: Column[], columnNames: string[]) {
    if (columns.length === 0 || columnNames.length === 0) {
      throw new Error('panic: unexpected empty table');
    }
    this.columns = columns;
    this.columnNames = columnNames;
  }

  static fromNamedColumns(columns: Value[], columnNames: string[]) {
    return new Table(
      columns.map((v) => getInstanceof(v, Column)),
      columnNames
    );
  }

  static fromMapping(mapping: AnyMapping<Column>) {
    const [columnNames, columns] = unzip(anyMappingToMap(mapping).entries());
    return new Table(columns, columnNames);
  }

  getColumn(name: string) {
    const index = this.columnNames.indexOf(name);
    if (index < 0 || index >= this.columns.length) {
      throw new RuntimeError(`Missing column ${name}`);
    }
    return this.columns[index];
  }

  getData() {
    return this.columns.map((column) => column.getData());
  }

  mapColumns(mapFn: (col: Column, index: number) => Column): Table {
    return Table.fromNamedColumns(this.columns.map(mapFn), this.columnNames);
  }

  filterColumns(fn: (colName: string, col: Column) => boolean): Table {
    const [names, columns] = filterUnzipped(this.columnNames, this.columns, fn);

    return Table.fromNamedColumns(columns, names);
  }
}

export class Row implements Value {
  cells: Value[];
  cellNames: string[];

  constructor(values: Value[], cellNames: string[]) {
    this.cells = values;
    this.cellNames = cellNames;
  }

  static fromNamedCells(cells: Value[], cellNames: string[]) {
    return new Row(cells, cellNames);
  }

  getCell(name: string): Value {
    const index = this.cellNames.indexOf(name);
    if (index < 0 || index >= this.cells.length) {
      throw new RuntimeError(`Missing cell ${name}`);
    }
    return this.cells[index];
  }

  getData() {
    return this.cells.map((v) => v.getData());
  }
}

type FromJSOneArg = Interpreter.OneResult | number | Date;
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
