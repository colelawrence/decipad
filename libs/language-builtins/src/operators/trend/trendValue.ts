// eslint-disable-next-line no-restricted-imports
import {
  getResultGenerator,
  serializeType,
  Value,
} from '@decipad/language-types';
import { type FullBuiltinSpec } from '../../types';
import { map, reduce, zip } from '@decipad/generator-utils';
import {
  Result,
  SerializedType,
  Type,
  Value as ValueInterface,
} from '@decipad/language-interfaces';
import { getDefined, getInstanceof } from '@decipad/utils';
import DeciNumber from '@decipad/number';

const firstAndLast = async (
  generator: Result.ResultGenerator
): Promise<[Result.OneResult | undefined, Result.OneResult | undefined]> => {
  const { first, last } = await reduce(
    generator(),
    (acc, v) => {
      if (acc.first == null) {
        acc.first = v;
      }
      acc.last = v;
      return acc;
    },
    {} as { first?: Result.OneResult; last?: Result.OneResult }
  );
  return [first, last];
};

const compareNumbers = (
  _a: Result.OneResult | undefined,
  _b: Result.OneResult | undefined
): ValueInterface.TrendValue => {
  const a = _a != null ? getInstanceof(_a, DeciNumber) : undefined;
  const b = _b != null ? getInstanceof(_b, DeciNumber) : undefined;

  return new Value.Trend(a, b, a && b && b.sub(a));
};

const getTableColumn = (table: Result.OneResult, columnIndex: number) => {
  if (!Array.isArray(table)) {
    throw new Error('table is not an array');
  }
  return getResultGenerator(table[columnIndex]);
};

const compareNumberColumns =
  async (
    columnA: Result.ResultGenerator,
    columnB: Result.ResultGenerator
  ): Promise<Result.ResultGenerator> =>
  (start = 0, end = Infinity) =>
    map(zip(columnA(start, end), columnB(start, end)), ([a, b]) =>
      compareNumbers(a, b)
    );

const compareColumns = async (
  columnType: Type,
  columnA: Result.ResultGenerator,
  columnB: Result.ResultGenerator
): Promise<Result.ResultGenerator> => {
  if (columnType.type === 'number') {
    console.log('compareNumberColumns');
    return compareNumberColumns(columnA, columnB);
  }
  return columnB;
};

const compareTables = async (
  tableType: Type,
  tableA: Result.OneResult | undefined,
  tableB: Result.OneResult | undefined
): Promise<Result.ResultGenerator[]> => {
  const columnNames = getDefined(tableType.columnNames);
  return Promise.all(
    columnNames.map(async (_, index) => {
      const columnType = getDefined(
        tableType.columnTypes?.[index],
        'could not find column type'
      );
      const columnA = getTableColumn(tableA, index);
      const columnB = getTableColumn(tableB, index);
      return compareColumns(columnType, columnA, columnB);
    })
  );
};

const getTableColumnType = (
  originalTypes: Type[] | null,
  colIndex: number
): SerializedType => {
  const cellType = serializeType(
    getDefined(
      originalTypes?.[colIndex],
      `could not find column type for column at index ${colIndex}`
    )
  );
  if (cellType.kind === 'number') {
    return {
      kind: 'trend',
      trendOf: cellType,
    };
  }
  return cellType;
};

export const trendValue: NonNullable<
  FullBuiltinSpec['fnValuesNoAutomap']
> = async ([thing], [argType]) => {
  if (Value.isColumnLike(thing)) {
    const [first, last] = await firstAndLast(
      getResultGenerator(await thing.getData())
    );
    const cellType = await argType.reduced();
    if ((await cellType.isTable()).errorCause == null) {
      // compare multiple tables
      const newColumns = await compareTables(cellType, first, last);
      return Value.Table.fromNamedColumns(
        newColumns.map((col, colIndex) =>
          Value.LeanColumn.fromGeneratorAndType(
            col,
            getTableColumnType(cellType.columnTypes, colIndex),
            undefined
          )
        ),
        getDefined(cellType.columnNames),
        undefined
      );
    } else if (cellType.type === 'number') {
      // calculate trend of numeric column
      return compareNumbers(first, last);
    }
  }
  throw new Error(
    'trendValue: expected value to be column of tables or numbers'
  );
};
