export interface ColumnLike<TValue> {
  values(start?: number, end?: number): AsyncGenerator<TValue>;
  atIndex(i: number): Promise<TValue | undefined>;
  rowCount(): number | Promise<number>;
}
