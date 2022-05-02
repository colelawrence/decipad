interface SerializedFraction {
  n: bigint;
  d: bigint;
  s: bigint;
}

interface TUnit<TNumberType> {
  unit: string;
  exp: TNumberType;
  multiplier: TNumberType;
  known: boolean;
  aliasFor?: TUnits<TNumberType>;
  enforceMultiplier?: boolean;
}

interface TUnits<TNumberType> {
  type: 'units';
  args: TUnit<TNumberType>[];
}

type SerializedUnits = TUnits<SerializedFraction>;

type TimeSpecificity =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

type SerializedType = Readonly<
  | { kind: 'number'; unit: SerializedUnits | null }
  | { kind: 'string' }
  | { kind: 'boolean' }
  | { kind: 'date'; date: TimeSpecificity }
>;

export type TableCellType =
  | Extract<SerializedType, { kind: 'number' }>
  | Extract<SerializedType, { kind: 'string' }>
  | Extract<SerializedType, { kind: 'boolean' }>
  | Extract<SerializedType, { kind: 'date' }>
  | { kind: 'table-formula'; source: string };

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}
