/* eslint-disable no-underscore-dangle */
import {
  count,
  firstOrUndefined,
  fromGeneratorPromise,
  map,
} from '@decipad/generator-utils';
import type { Dimension, Result, Value } from '@decipad/language-interfaces';
import { getResultGenerator } from '../utils/getResultGenerator';
import { lowLevelGet } from './lowLevelGet';
import { typedResultToValue } from '../utils/typedResultToValue';
import type { Type } from '../Type/Type';

export class ColumnGenerator implements Value.ColumnLikeValue {
  private _typedResultToValue: Promise<
    (result: Result.OneResult) => Value.Value
  >;
  private gen: () => AsyncGenerator<Value.ColumnLikeValue>;
  private _dimensions: Dimension[];

  constructor(
    type: Type,
    gen: () => AsyncGenerator<Value.ColumnLikeValue>,
    dimensions: Dimension[]
  ) {
    this._typedResultToValue = typedResultToValue(type);
    this.gen = gen;
    this._dimensions = dimensions;
  }

  async getData(): Promise<Result.OneResult> {
    const { gen } = this;
    return async function* generateData(start = 0, end = Infinity) {
      let index = -1;
      for await (const col of gen()) {
        const dataGen = getResultGenerator(await col.getData())();
        for await (const data of dataGen) {
          index += 1;
          if (index >= start && index < end) {
            yield data;
          }
        }
      }
    };
  }

  async lowLevelGet(...keys: number[]): Promise<Value.Value> {
    return lowLevelGet(await this.atIndex(keys[0]), keys.slice(1));
  }

  async dimensions(): Promise<Dimension[]> {
    return this._dimensions;
  }

  values(start = 0, end = Infinity): AsyncGenerator<Value.Value> {
    return fromGeneratorPromise(
      (async () =>
        map(
          fromGeneratorPromise(
            (async () => getResultGenerator(await this.getData())(start, end))()
          ),
          await this._typedResultToValue
        ))()
    );
  }

  async atIndex(i: number) {
    return firstOrUndefined(this.values(i, i + 1));
  }

  async rowCount(): Promise<number> {
    return count(
      fromGeneratorPromise(
        (async () => getResultGenerator(await this.getData())())()
      )
    );
  }
}
