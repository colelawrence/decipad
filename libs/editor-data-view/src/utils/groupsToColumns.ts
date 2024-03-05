import {
  RemoteComputer,
  Result,
  SerializedType,
  Unknown,
} from '@decipad/remote-computer';
import { AggregationKind, Column, DataGroup } from '../types';
import { aggregate } from './aggregate';

const concatenate = (a: Column[], b: Column[]): Column[] => {
  return b.map((col, i) => ({
    ...col,
    value: (a[i]?.value ?? []).concat(col.value),
  }));
};

export interface GroupsToColumnsOptions {
  computer: RemoteComputer;
  tableName?: string;
  groups: DataGroup[];
  aggregationTypes: (AggregationKind | undefined)[];
  roundings: Array<string | undefined>;
}

// eslint-disable-next-line complexity
export const groupsToColumns = async ({
  computer,
  tableName,
  groups,
  aggregationTypes,
  roundings,
}: GroupsToColumnsOptions): Promise<Column[]> => {
  let type: SerializedType | undefined;
  let values: Result.OneResult[] = [];
  let columnName: string | undefined;
  let childrenColumns: Column[] = [];

  for (const group of groups) {
    if (group.id === 'total') {
      continue;
    }
    if (group.elementType === 'group') {
      // type
      if (!type && group.type) {
        type = group.type;
      }

      // value
      const value: Result.OneResult =
        (group.value as Result.OneResult) ?? Unknown;
      if (Array.isArray(value)) {
        values = values.concat(value);
      } else {
        values.push(value);
      }

      // name
      if (!columnName && group.column) {
        columnName = group.column.name;
      }
    } else {
      // group.elementType === 'smartrow'
      const { name, type: columnType } = group.column;
      if (!columnName) {
        columnName = name;
      }
      if (!type && columnType) {
        type = columnType;
      }
      const aggregationType = aggregationTypes[0];
      if (!aggregationType) {
        values.push(Unknown);
      } else {
        // eslint-disable-next-line no-await-in-loop
        const { result } = await aggregate({
          computer,
          tableName,
          aggregationType,
          column: group.column,
          previousColumns: group.previousColumns,
          roundings,
        });
        if (result.value != null) {
          values.push(result.value);
        }
      }
    }

    // recurse next columns
    if (group.children.length) {
      childrenColumns = concatenate(
        childrenColumns,
        // eslint-disable-next-line no-await-in-loop
        await groupsToColumns({
          computer,
          tableName,
          groups: group.children,
          aggregationTypes: aggregationTypes.slice(1),
          roundings: roundings.slice(1),
        })
      );
    } else if (aggregationTypes.length > 1) {
      const missing: Array<undefined> = Array.from({
        length: aggregationTypes.length - 1,
      });
      childrenColumns = concatenate(
        childrenColumns,
        // eslint-disable-next-line no-await-in-loop
        await groupsToColumns({
          computer,
          tableName,
          groups: [
            {
              elementType: 'group',
              children: [],
              previousColumns: [],
              replicaCount: 1,
              columnIndex: 0,
            },
          ],
          aggregationTypes: missing,
          roundings: missing,
        })
      );
    }

    // extend current column to match length of next column
    const nextColumn = childrenColumns[0];
    if (nextColumn && values.length) {
      while (nextColumn.value.length > values.length) {
        values.push(values[values.length - 1]);
      }
      while (nextColumn.value.length < values.length) {
        nextColumn.value.push(Unknown);
      }
    }
  }
  if (!values.length) {
    return [];
  }
  return [
    {
      type: type ?? { kind: 'pending' },
      value: values.length ? values : [Unknown],
      name: columnName ?? 'unknown',
    },
    ...childrenColumns,
  ];
};
