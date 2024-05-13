import type { Value } from '..';
import type { Dimension } from '../Dimension/Dimension';
import type { OneResult } from '../Result';
import type { ColumnLikeValue } from './ColumnLike';

export abstract class ColumnBase implements ColumnLikeValue {
  private dimensionsCache: undefined | Dimension[];
  private dataCache: undefined | Promise<OneResult>;
  private rowCountCache: undefined | number;

  abstract getDimensions(): Promise<Dimension[]>;
  async dimensions(): Promise<Dimension[]> {
    if (!this.dimensionsCache) {
      this.dimensionsCache = await this.getDimensions();
    }
    return this.dimensionsCache;
  }

  abstract getGetData(): Promise<OneResult>;
  async getData(): Promise<OneResult> {
    if (!this.dataCache) {
      this.dataCache = this.getGetData();
    }
    return this.dataCache;
  }

  abstract getRowCount(): number | Promise<number>;
  async rowCount(): Promise<number> {
    if (!this.rowCountCache) {
      this.rowCountCache = await this.getRowCount();
    }
    return this.rowCountCache;
  }

  abstract values(start?: number, end?: number): AsyncGenerator<Value.Value>;
  abstract atIndex(i: number): Promise<Value.Value | undefined>;
  abstract lowLevelGet(...keys: number[]): Promise<Value.Value>;
}
