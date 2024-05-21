/* eslint-disable no-underscore-dangle */
import { from } from '@decipad/generator-utils';
import type { Dimension, Result, Value } from '@decipad/language-interfaces';
import { isColumnLike } from './ColumnLike';
import { EmptyColumn } from './EmptyColumn';
import { GeneratorColumn } from './GeneratorColumn';
import type { ValueGeneratorFunction } from './ValueGenerator';
import { lowLevelGet } from './lowLevelGet';
import { UnknownValue } from './Unknown';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { once } from '@decipad/utils';
import { ColumnBase } from './ColumnBase';

export class Column extends ColumnBase {
  readonly _values: ReadonlyArray<Value.Value>;
  private defaultValue?: Value.Value;

  constructor(values: ReadonlyArray<Value.Value>, defaultValue?: Value.Value) {
    super();
    this._values = values;
    this.defaultValue = defaultValue;
  }

  async getDimensions() {
    const contents = this._values[0];

    return [
      { dimensionLength: once(async () => this.rowCount()) },
      ...(isColumnLike(contents) ? await contents.dimensions() : []),
    ];
  }

  async lowLevelGet(...keys: number[]) {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  /**
   * Create a column from the values inside. Empty columns return a special value.
   */
  static fromValues(
    values: ReadonlyArray<Value.Value>,
    defaultValue?: Value.Value,
    innerDimensions?: Dimension[]
  ): Value.ColumnLikeValue {
    if (values.length === 0) {
      if (innerDimensions) {
        // We can create a column with no values
        return new EmptyColumn(innerDimensions);
      }
      throw new Error('panic: Empty columns are forbidden');
    }
    return new Column(values, defaultValue);
  }

  static fromGenerator(
    gen: ValueGeneratorFunction,
    desc = `Column.fromGenerator(${gen.name})`
  ): Value.ColumnLikeValue {
    return GeneratorColumn.fromGenerator(gen, desc);
  }

  values(start = 0, end = Infinity) {
    return from(this._values.slice(start, end));
  }

  async getRowCount() {
    return Promise.resolve(this._values.length);
  }

  async atIndex(i: number): Promise<Value.Value> {
    return this._values[i] ?? this.defaultValue ?? UnknownValue;
  }

  async getGetData(): Promise<Result.OneResult> {
    return Promise.resolve(columnValueToResultValue(this));
  }
}
