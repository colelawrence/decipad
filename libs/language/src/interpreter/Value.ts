/* eslint-disable no-underscore-dangle */
import Fraction, { toFraction } from '@decipad/fraction';
import { unzip, getDefined, AnyMapping, anyMappingToMap } from '@decipad/utils';
import { DeepReadonly } from 'utility-types';
import { Interpreter, Time } from '..';
import { addTime, cleanDate } from '../date';
import { Dimension, EmptyColumn, lowLevelGet } from '../lazy';
import { filterUnzipped } from '../utils';
import { RuntimeError } from '.';
import { Unknown } from './Unknown';
import { getLabelIndex } from '../dimtools';

export * as ValueTransforms from './ValueTransforms';

export interface Value {
  getData(): Interpreter.OneResult;
}

export interface ColumnLike extends Value {
  values: DeepReadonly<Value[]>;
  atIndex(i: number): DeepReadonly<Value>;
  rowCount: number;
  getData(): Interpreter.OneResult;
  lowLevelGet(...keys: number[]): Value;
  /** Useful when filtering or sorting.
   * By default the identity function is used and no index changes are assumed to exist */
  indexToLabelIndex?: (index: number) => number;
  dimensions: Dimension[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isColumnLike = (thing: any): thing is ColumnLike => {
  const col = thing as ColumnLike;
  return typeof col === 'object' && typeof col?.lowLevelGet === 'function';
};

export const getColumnLike = (
  thing: Value,
  message = 'panic: expected column-like value'
): ColumnLike => {
  if (!isColumnLike(thing)) {
    throw new Error(message);
  }
  return thing;
};

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
      this.value = toFraction(varValue as number | bigint);
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

export class DateValue implements Value {
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
    return addTime(this.moment, this.specificity, 1n) - 1n;
  }

  getEndDate() {
    const moment = this.getEnd();
    return new DateValue(moment, this.specificity);
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

export class Column implements ColumnLike {
  readonly _values: DeepReadonly<Value[]>;

  constructor(values: DeepReadonly<Column['values']>) {
    this._values = values;
  }

  get dimensions() {
    const contents = this.values[0];

    if (isColumnLike(contents)) {
      return [{ dimensionLength: this.rowCount }, ...contents.dimensions];
    } else {
      return [{ dimensionLength: this.rowCount }];
    }
  }

  lowLevelGet(...keys: number[]) {
    return lowLevelGet(this.atIndex(keys[0]), keys.slice(1));
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  static fromValues(
    values: DeepReadonly<Value[]>,
    innerDimensions?: Dimension[]
  ): ColumnLike {
    if (values.length === 0) {
      if (innerDimensions) {
        // We can create a column with no values
        return new EmptyColumn(innerDimensions);
      }
      throw new Error('panic: Empty columns are forbidden');
    }
    return new Column(values);
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
}

export class MappedColumn extends Column implements ColumnLike {
  private map: number[];
  sourceColumn: ColumnLike;

  constructor(col: ColumnLike, map: number[]) {
    super(col.values);
    this.sourceColumn = col;
    this.map = map;
  }

  get values(): Value[] {
    return this.map.map((index) => this._values[index]);
  }

  static fromColumnAndMap(column: ColumnLike, map: number[]): MappedColumn {
    return new MappedColumn(column, map);
  }

  get rowCount() {
    return this.map.length;
  }

  atIndex(index: number) {
    return this._values[this.map[index]];
  }

  indexToLabelIndex(mappedIndex: number) {
    return getLabelIndex(this.sourceColumn, this.map[mappedIndex]);
  }
}

export class FilteredColumn extends Column implements ColumnLike {
  private map: boolean[];
  private sourceColumn: ColumnLike;

  constructor(col: ColumnLike, map: boolean[]) {
    super(col.values);
    this.sourceColumn = col;
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

  static fromColumnAndMap(column: ColumnLike, map: boolean[]): FilteredColumn {
    return new FilteredColumn(column, map);
  }

  get rowCount() {
    let count = 0;
    for (const bool of this.map) {
      count += Number(bool);
    }
    return count;
  }

  private getSourceIndex(outwardIndex: number) {
    let trueCount = -1;
    for (let sourceIndex = 0; sourceIndex < this.map.length; sourceIndex++) {
      if (this.map[sourceIndex] === true) {
        trueCount++;
        if (trueCount === outwardIndex) {
          return sourceIndex;
        }
      }
    }

    throw new Error(`panic: index not found: ${outwardIndex}`);
  }

  atIndex(wantedIndex: number) {
    return this._values[this.getSourceIndex(wantedIndex)];
  }

  indexToLabelIndex(filteredIndex: number) {
    const sourceIndex = this.getSourceIndex(filteredIndex);
    return getLabelIndex(this.sourceColumn, sourceIndex);
  }
}

export class Table implements Value {
  columns: ColumnLike[];
  columnNames: string[];

  constructor(columns: ColumnLike[], columnNames: string[]) {
    if (columns.length === 0 || columnNames.length === 0) {
      throw new Error('panic: unexpected empty table');
    }
    this.columns = columns;
    this.columnNames = columnNames;
  }

  static fromNamedColumns(columns: Value[], columnNames: string[]) {
    return new Table(
      columns.map((v) => getColumnLike(v)),
      columnNames
    );
  }

  get tableRowCount() {
    return this.columns[0].rowCount;
  }

  static fromMapping(mapping: AnyMapping<ColumnLike>) {
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

  mapColumns(mapFn: (col: ColumnLike, index: number) => ColumnLike): Table {
    return Table.fromNamedColumns(this.columns.map(mapFn), this.columnNames);
  }

  filterColumns(fn: (colName: string, col: ColumnLike) => boolean): Table {
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

export type FromJSArg =
  | string
  | boolean
  | number
  | bigint
  | Date
  | Fraction
  | FromJSArg[];

export const fromJS = (thing: FromJSArg): Value => {
  // TODO this doesn't distinguish Range/Date from Column, and it can't possibly do it!
  if (thing == null) {
    throw new TypeError('result cannot be null');
  }
  if (!Array.isArray(thing)) {
    return Scalar.fromValue(thing);
  } else if (thing.length === 0) {
    return Column.fromValues([], []);
  } else {
    return Column.fromValues(thing.map((t) => fromJS(t)));
  }
};
