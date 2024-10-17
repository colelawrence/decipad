import type { Result, Value, Dimension } from '@decipad/language-interfaces';

export abstract class ColumnBase implements Value.ColumnLikeValue {
  private dimensionsCache: undefined | Dimension[];
  private dataCache: undefined | Promise<Result.OneResult>;
  private rowCountCache: undefined | number;

  abstract getDimensions(): Promise<Dimension[]>;
  async dimensions(): Promise<Dimension[]> {
    if (!this.dimensionsCache) {
      this.dimensionsCache = await this.getDimensions();
    }
    return this.dimensionsCache;
  }

  abstract getGetData(): Promise<Result.OneResult>;
  async getData(): Promise<Result.OneResult> {
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
  abstract lowLowLevelGet(...keys: number[]): Promise<Result.OneResult>;
  abstract meta: undefined | (() => undefined | Result.ResultMetadataColumn);
}
