import {
  count,
  firstOrUndefined,
  from,
  memoizing,
  slice,
} from '@decipad/generator-utils';
import type { OneResult } from '../Result';
import { isColumnLike, type ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import type { ValueGeneratorFunction } from './ValueGenerator';
import type { Dimension } from '../Dimension';
import { columnValueToResultValue } from '../utils/columnValueToResultValue';
import { lowLevelGet } from './lowLevelGet';
import { getDefined } from '@decipad/utils';

const MAX_GENERATOR_MEMO_ELEMENTS = 10_000;

export class GeneratorColumn implements ColumnLikeValue {
  private gen: ValueGeneratorFunction;
  private memo: undefined | Array<Value>;
  private partialMemo: undefined | boolean;

  constructor(gen: ValueGeneratorFunction) {
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
