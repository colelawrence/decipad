/* eslint-disable no-underscore-dangle */
import DeciNumber, { N } from '@decipad/number';
import { unzip, getDefined, AnyMapping, anyMappingToMap } from '@decipad/utils';
import {
  MappedColumn as MappedColumnBase,
  FilteredColumn as FilteredColumnBase,
} from '@decipad/column';
import { DeepReadonly } from 'utility-types';
import { Interpreter, Time } from '..';
import { addTime, cleanDate } from '../date';
import { Dimension, EmptyColumn, lowLevelGet } from '../lazy';
import { filterUnzipped } from '../utils';
import { RuntimeError } from '.';
import { Unknown } from './Unknown';
import { getLabelIndex } from '../dimtools/getLabelIndex';
import {
  Value,
  NonColumn,
  isColumnLike,
  getColumnLike,
  ColumnLikeValue,
} from './types';

export const UnknownValue: Value = {
  getData() {
    return Unknown;
  },
};

export class Scalar {
  static fromValue(
    value: number | bigint | DeciNumber | boolean | string | symbol | Date
  ): NonColumn {
    if (value instanceof Date) {
      return DateValue.fromDateAndSpecificity(value.getTime(), 'millisecond');
    }
    if (value instanceof DeciNumber) {
      return NumberValue.fromValue(value);
    }
    const t = typeof value;
    if (t === 'number' || t === 'bigint') {
      return NumberValue.fromValue(value as number | bigint);
    }
    if (t === 'boolean') {
      return BooleanValue.fromValue(value as boolean);
    }
    return StringValue.fromValue(value as string);
  }
}

export class NumberValue implements Value {
  readonly value: DeciNumber;

  constructor(varValue: number | bigint | DeciNumber) {
    const t = typeof varValue;
    if (t === 'number' || t === 'bigint') {
      this.value = N(varValue as number | bigint);
    } else {
      this.value = varValue as DeciNumber;
    }
  }

  getData() {
    return this.value;
  }

  static fromValue(value: number | bigint | DeciNumber): NumberValue {
    return new NumberValue(value);
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
  moment: bigint | undefined;

  constructor(moment: bigint | undefined, specificity: Time.Specificity) {
    this.moment = moment;
    this.specificity = specificity;
  }

  static fromDateAndSpecificity(
    date: bigint | number | undefined,
    specificity: Time.Specificity
  ): DateValue {
    return new DateValue(cleanDate(date, specificity), specificity);
  }

  getData() {
    return this.moment;
  }

  /**
   * Dates such as month, day and year, have a start and end. getData() gets us the first millisecond of that range. getEnd gets us the last.
   */
  getEnd() {
    const end = addTime(this.moment, this.specificity, 1n);
    if (end == null) {
      return undefined;
    }
    return end - 1n;
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
    } else if (start instanceof NumberValue && end instanceof NumberValue) {
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

export class Column implements ColumnLikeValue {
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
  ): ColumnLikeValue {
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

export class MappedColumn
  extends MappedColumnBase<Value>
  implements ColumnLikeValue
{
  private sourceColumn: ColumnLikeValue;

  constructor(source: ColumnLikeValue, map: number[]) {
    super(source, map);
    this.sourceColumn = source;
  }

  getData(): Interpreter.OneResult[] {
    return this.values.map((value) => value.getData());
  }

  lowLevelGet(...keys: number[]) {
    return lowLevelGet(this.atIndex(keys[0]), keys.slice(1));
  }

  get dimensions() {
    const contents = this.values[0];

    if (isColumnLike(contents)) {
      return [{ dimensionLength: this.rowCount }, ...contents.dimensions];
    } else {
      return [{ dimensionLength: this.rowCount }];
    }
  }

  static fromColumnValueAndMap(
    column: ColumnLikeValue,
    map: number[]
  ): MappedColumn {
    return new MappedColumn(Column.fromValues(column.values), map);
  }

  indexToLabelIndex(mappedIndex: number) {
    return getLabelIndex(this.sourceColumn, this.map[mappedIndex]);
  }
}

export class FilteredColumn
  extends FilteredColumnBase<Value>
  implements ColumnLikeValue
{
  private sourceColumn2: ColumnLikeValue;

  constructor(column: ColumnLikeValue, map: boolean[]) {
    super(column, map);
    this.sourceColumn2 = column;
  }

  getData(): Interpreter.OneResult[] {
    return this.values.map((value) => value.getData());
  }

  lowLevelGet(...keys: number[]) {
    return lowLevelGet(this.atIndex(keys[0]), keys.slice(1));
  }

  get dimensions() {
    const contents = this.values[0];

    if (isColumnLike(contents)) {
      return [{ dimensionLength: this.rowCount }, ...contents.dimensions];
    } else {
      return [{ dimensionLength: this.rowCount }];
    }
  }

  static fromColumnValueAndMap(
    column: ColumnLikeValue,
    map: boolean[]
  ): FilteredColumn {
    return new FilteredColumn(column, map);
  }

  indexToLabelIndex(filteredIndex: number) {
    const sourceIndex = this.getSourceIndex(filteredIndex);
    return getLabelIndex(this.sourceColumn2, sourceIndex);
  }
}

export class Table implements Value {
  columns: ColumnLikeValue[];
  columnNames: string[];

  constructor(columns: ColumnLikeValue[], columnNames: string[]) {
    this.columns = columns;
    this.columnNames = columnNames;
  }

  static fromNamedColumns(columns: Value[], columnNames: string[]) {
    return new Table(
      columns.map((v) => getColumnLike(v)),
      columnNames
    );
  }

  get tableRowCount(): number | undefined {
    return this.columns.at(0)?.rowCount;
  }

  static fromMapping(mapping: AnyMapping<ColumnLikeValue>) {
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

  mapColumns(
    mapFn: (col: ColumnLikeValue, index: number) => ColumnLikeValue
  ): Table {
    return Table.fromNamedColumns(this.columns.map(mapFn), this.columnNames);
  }

  filterColumns(fn: (colName: string, col: ColumnLikeValue) => boolean): Table {
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
  | DeciNumber
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
