/* eslint-disable no-underscore-dangle */
import DeciNumber, { N } from '@decipad/number';
import { unzip, AnyMapping, anyMappingToMap, getDefined } from '@decipad/utils';
import {
  MappedColumn as MappedColumnBase,
  FilteredColumn as FilteredColumnBase,
} from '@decipad/column';
import {
  count,
  first,
  firstOrUndefined,
  from,
  memoizing,
  slice,
} from '@decipad/generator-utils';
import { Result, Time } from '..';
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
  ColumnLikeValue,
  ValueGeneratorFunction,
} from './types';
import { columnValueToResultValue } from './columnValueToResultValue';
import { columnValueToValueGeneratorFunction } from './columnValueToValueGeneratorFunction';
import { OneResult } from '../result';

export const UnknownValue: Value = {
  async getData() {
    return Promise.resolve(Unknown);
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

  async getData() {
    return Promise.resolve(this.value);
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

  async getData() {
    return Promise.resolve(this.value);
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

  async getData() {
    return Promise.resolve(this.value);
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

  async getData() {
    return Promise.resolve(this.moment);
  }

  /**
   * Dates such as month, day and year, have a start and end. getData() gets us the first millisecond of that range. getEnd gets us the last.
   */
  async getEnd() {
    const end = await addTime(this.moment, this.specificity, 1n);
    if (end == null) {
      return undefined;
    }
    return end - 1n;
  }

  async getEndDate() {
    const moment = await this.getEnd();
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

  static async fromBounds(start: Value, end: Value): Promise<Range> {
    if (start instanceof DateValue && end instanceof DateValue) {
      return new Range({
        start,
        end: await end.getEndDate(),
      });
    } else if (start instanceof NumberValue && end instanceof NumberValue) {
      return new Range({ start, end });
    } else {
      throw new Error(
        `panic: bad Range.fromBounds arguments ${start.constructor.name} and ${end.constructor.name}`
      );
    }
  }

  async getData() {
    return [await this.start.getData(), await this.end.getData()];
  }
}

export class Column implements ColumnLikeValue {
  readonly _values: ReadonlyArray<Value>;
  private defaultValue?: Value;

  constructor(values: ReadonlyArray<Value>, defaultValue?: Value) {
    this._values = values;
    this.defaultValue = defaultValue;
  }

  async dimensions() {
    const contents = this._values[0];

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: await this.rowCount() },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: await this.rowCount() }];
    }
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  static fromValues(
    values: ReadonlyArray<Value>,
    defaultValue?: Value,
    innerDimensions?: Dimension[]
  ): ColumnLikeValue {
    if (values.length === 0) {
      if (innerDimensions) {
        // We can create a column with no values
        return new EmptyColumn(innerDimensions);
      }
      throw new Error('panic: Empty columns are forbidden');
    }
    return new Column(values, defaultValue);
  }

  static fromGenerator(gen: ValueGeneratorFunction): ColumnLikeValue {
    return GeneratorColumn.fromGenerator(gen);
  }

  values(start = 0, end = Infinity) {
    return from(this._values.slice(start, end));
  }

  async rowCount() {
    return Promise.resolve(this._values.length);
  }

  async atIndex(i: number): Promise<Value> {
    return this._values[i] ?? this.defaultValue ?? UnknownValue;
  }

  async getData(): Promise<OneResult> {
    return Promise.resolve(columnValueToResultValue(this));
  }
}

type ValueGenerator = (...args: never) => AsyncGenerator<Value>;

const MAX_GENERATOR_MEMO_ELEMENTS = 10_000;

export class GeneratorColumn implements ColumnLikeValue {
  private gen: ValueGenerator;
  private memo: undefined | Array<Value>;
  private partialMemo: undefined | boolean;

  constructor(gen: ValueGenerator) {
    this.gen = gen;
  }
  indexToLabelIndex?: ((index: number) => Promise<number>) | undefined;
  async dimensions(): Promise<Dimension[]> {
    const contents = await firstOrUndefined(this.gen());

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: await this.rowCount() },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: await this.rowCount() }];
    }
  }

  async getData(): Promise<OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1)).catch(
      (err) => {
        console.error('GeneratorColumn lowLevelGet error', err, this.gen);
        throw err;
      }
    );
  }

  async atIndex(i: number): Promise<Value | undefined> {
    if (this.memo && i < this.memo.length) {
      return this.memo[i];
    }
    return firstOrUndefined(this.values(i, i + 1));
  }
  async rowCount(): Promise<number> {
    return count(this.values());
  }

  values(start = 0, end = Infinity) {
    if (
      this.memo != null &&
      (end < this.memo.length || !getDefined(this.partialMemo))
    ) {
      return slice(from(this.memo), start, end);
    }
    return slice(
      memoizing(
        this.gen(),
        (all, partial) => {
          this.memo = all;
          this.partialMemo = partial;
        },
        MAX_GENERATOR_MEMO_ELEMENTS
      ),
      start,
      end
    );
  }

  static fromGenerator(
    gen: (start?: number, end?: number) => AsyncGenerator<Value>
  ) {
    return new GeneratorColumn(gen);
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

  async getData(): Promise<Result.OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions() {
    const contents = first(this.values());

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: await this.rowCount() },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: await this.rowCount() }];
    }
  }

  static fromColumnValueAndMap(
    column: ColumnLikeValue,
    map: number[]
  ): MappedColumn {
    return new MappedColumn(
      Column.fromGenerator(columnValueToValueGeneratorFunction(column)),
      map
    );
  }

  async indexToLabelIndex(mappedIndex: number) {
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

  async getData(): Promise<Result.OneResult> {
    return columnValueToResultValue(this);
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions() {
    const contents = first(this.values());

    if (isColumnLike(contents)) {
      return [
        { dimensionLength: await this.rowCount() },
        ...(await contents.dimensions()),
      ];
    } else {
      return [{ dimensionLength: await this.rowCount() }];
    }
  }

  static fromColumnValueAndMap(
    column: ColumnLikeValue,
    map: boolean[]
  ): FilteredColumn {
    return new FilteredColumn(column, map);
  }

  async indexToLabelIndex(filteredIndex: number) {
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
      columns.map((c) => (isColumnLike(c) ? c : new EmptyColumn([]))),
      columnNames
    );
  }

  async tableRowCount(): Promise<number | undefined> {
    return this.columns.at(0)?.rowCount();
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

  async getData(): Promise<Result.OneResult> {
    return Promise.all(this.columns.map(async (column) => column.getData()));
  }

  async mapColumns(
    mapFn: (
      col: ColumnLikeValue,
      index: number
    ) => Promise<ColumnLikeValue> | ColumnLikeValue
  ): Promise<Table> {
    return Table.fromNamedColumns(
      await Promise.all(this.columns.map(mapFn)),
      this.columnNames
    );
  }

  filterColumns(fn: (colName: string, col: ColumnLikeValue) => boolean): Table {
    const [names, columns] = filterUnzipped(this.columnNames, this.columns, fn);

    return Table.fromNamedColumns(columns, names);
  }
}

export const isTableValue = (v: Value | undefined | null): v is Table =>
  v instanceof Table;

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

  async getData() {
    return Promise.all(this.cells.map(async (v) => v.getData()));
  }
}

type ValidFromJSArg =
  | string
  | boolean
  | number
  | bigint
  | Date
  | DeciNumber
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function;

export type FromJSArg = symbol | undefined | FromJSArg[] | ValidFromJSArg;

const invalidTypes = new Set(['symbol']);

const validateFromJsArg = (thing: FromJSArg): thing is ValidFromJSArg => {
  if (thing == null) {
    throw new TypeError('result cannot be null or undefined');
  }
  if (invalidTypes.has(typeof thing)) {
    throw new TypeError('result cannot be symbol or function');
  }
  return true;
};

export const fromJS = (thing: FromJSArg, defaultValue?: Value): Value => {
  // TODO this doesn't distinguish Range/Date from Column, and it can't possibly do it!
  if (!validateFromJsArg(thing)) {
    throw new TypeError(`invalid result ${thing?.toString()}`);
  }
  if (typeof thing === 'function') {
    return Column.fromGenerator(thing as ValueGeneratorFunction);
  }
  if (!Array.isArray(thing)) {
    return Scalar.fromValue(thing);
  }
  if (thing.length === 0) {
    return Column.fromValues([], defaultValue, []);
  }
  return Column.fromValues(
    thing.map((t) => fromJS(t, defaultValue)),
    defaultValue
  );
};
