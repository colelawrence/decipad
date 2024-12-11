import {
  getExprRef,
  materializeResult,
  safeNumberForPrecision,
  Unit,
} from '@decipad/computer';
import { Computer } from '@decipad/computer-interfaces';
import {
  useComputer,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import {
  MyElement,
  PlotElement,
  TimeSeriesElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  SerializedType,
  AutocompleteName,
  Result,
} from '@decipad/language-interfaces';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';
import {
  isTable as isComputerTable,
  isTableKind as isComputerTableKind,
} from '@decipad/computer-utils';
import DeciNumber from '@decipad/number';
import { formatResult } from '@decipad/format';
import { groupBy, sortBy } from 'lodash';
import { Column, DataGroup } from '../types';

const isTable = (name: AutocompleteName) =>
  !name.name.includes('.') && isComputerTableKind(name.kind);

function isNumber(type: SerializedType) {
  return type.kind === 'number';
}

function isBoolean(type: SerializedType) {
  return type.kind === 'boolean';
}

function isString(type: SerializedType) {
  return type.kind === 'string';
}

function isDate(type: SerializedType) {
  return type.kind === 'date';
}
const validTypes = [isNumber, isBoolean, isString, isDate];

function isValidType(type: SerializedType) {
  return validTypes.some((guard) => guard(type));
}

export const useTimeSeriesData = (
  element: TimeSeriesElement,
  sortedColumns?: Column[]
) => {
  const editor = useMyEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const tableNames = computer.getNamesDefined$.useWithSelectorDebounced(
    500,
    (n) =>
      n
        .filter(isTable)
        .map((table) => autocompleteNameToExprRef(computer, table))
  );

  // const setvarName = usePathMutatorCallback<PlotElement>(
  //   editor,
  //   path,
  //   'varName',
  //   'usePlot'
  // );

  const blockId = element.varName || '';
  const tableName = computer.getSymbolDefinedInBlock$.use(blockId);

  const source = computer.getVarResult$.use(tableName ?? '')?.result;
  // const source = computer.getVarResult$.use(element.varName ?? '')?.result;
  const sourceType: SerializedType | undefined = source?.type;

  const resolvedResult = useResolved(
    useMemo(
      () => resultToTimeSeriesData(source, sortedColumns),
      [sortedColumns, source]
    )
  );

  const allNameOptions = useMemo(() => {
    return isComputerTable(sourceType) ? sourceType.columnNames : [];
  }, [sourceType]);

  const allTypeOptions = useMemo(() => {
    return isComputerTable(sourceType) ? sourceType.columnTypes : [];
  }, [sourceType]);

  const { columnNameOptions, columnTypeOptions } = useMemo(() => {
    const fColumnNameOptions = [];
    const fColumnTypeOptions = [];
    for (let i = 0; i < allTypeOptions.length; i++) {
      if (isValidType(allTypeOptions[i])) {
        fColumnNameOptions.push(allNameOptions[i]);
        fColumnTypeOptions.push(allTypeOptions[i]);
      }
    }
    return {
      columnTypeOptions: fColumnTypeOptions,
      columnNameOptions: fColumnNameOptions,
    };
  }, [allNameOptions, allTypeOptions]);

  return {
    varNameOptions: tableNames.map((name) => name.name),
    sourceExprRefOptions: tableNames.map((name) => name.exprRef),
    columnNameOptions,
    columnTypeOptions,

    data: resolvedResult,

    tableNames,
    sourceType,
  };
};

const autocompleteNameToExprRef = (
  computer: Computer,
  table: AutocompleteName
): AutocompleteNameWithExpRef => {
  return {
    ...table,
    exprRef: getExprRef(computer.getVarBlockId(table.name) ?? ''),
  };
};

export async function resultToTimeSeriesData(
  _result: undefined | Result.Result,
  sortedColumns?: Column[]
) {
  if (!_result || _result.type.kind !== 'table') {
    return;
  }
  const type = _result?.type;
  if (!type || type.kind !== 'table') {
    return;
  }

  const allColumnNames = sortedColumns?.map((x) => x.name);
  const result = await materializeResult(_result);
  const value = result?.value;

  if (!value) {
    return;
  }
  const tableValue = value as Result.ResultMaterializedTable;
  const columnNames = allColumnNames; // relevantColumnNames(displayProps);
  const columnsAllTypesAndResults: Array<[SerializedType, Result.OneResult[]]> =
    allColumnNames.map((columnName): [SerializedType, Result.OneResult[]] => {
      const index = type.columnNames.indexOf(columnName);
      return [type.columnTypes[index], tableValue[index]];
    });

  // const returnValueGroupByDate: Record<
  //   string,
  //   Record<string, Array<number | string>>
  // > = {};

  // console.log('columnsAllTypesAndResults :', columnsAllTypesAndResults);

  // // TODO ASSUMING DATE AS FIRST FIELD
  const allDates = toPlotColumn(
    columnsAllTypesAndResults[0][0],
    columnsAllTypesAndResults[0][1]
  );
  const uniqueDates = [...new Set(allDates)];

  // columnsAllTypesAndResults.forEach(([columnType, values], index) => {
  //   const plotValueThatIsAcceptable = toPlotColumn(columnType, values);

  //   values.map((col, colIndex) => {
  //     col;
  //   });
  // });

  const returnValue: Record<string, Array<number | string>> = {};
  const returnValueUnfiltered: Record<string, Array<number | string>> = {};
  const uniqueCategoricalValueUnfiltered: Record<
    string,
    Array<number | string>
  > = {};
  const uniqueNumericalValueUnfiltered: Record<
    string,
    Array<number | string>
  > = {};

  allColumnNames.forEach((columnName, index) => {
    const [columnType, values] = columnsAllTypesAndResults[index];
    const plotValueThatIsAcceptable = toPlotColumn(columnType, values);

    const uniqueValues = new Map();

    if (plotValueThatIsAcceptable) {
      returnValueUnfiltered[columnName] = plotValueThatIsAcceptable;

      if (['string'].includes(columnType.kind)) {
        uniqueCategoricalValueUnfiltered[columnName] = [
          ...new Set(plotValueThatIsAcceptable),
        ];

        plotValueThatIsAcceptable.forEach((val) => {
          if (uniqueValues.has(val)) {
            const prevCount = uniqueValues.get(val) + 1;
            uniqueValues.set(val, prevCount);
          } else {
            uniqueValues.set(val, 1);
          }
        });
      }

      if (['number', 'boolean'].includes(columnType.kind))
        uniqueNumericalValueUnfiltered[columnName] = [
          ...new Set(plotValueThatIsAcceptable),
        ];

      if (columnNames.includes(columnName)) {
        returnValue[columnName] = plotValueThatIsAcceptable;
      }
    }
  });
  const categoricalColumns = Object.keys(uniqueCategoricalValueUnfiltered);
  const numericalColumns = Object.keys(uniqueNumericalValueUnfiltered);
  const categoricalColumnsWithDate = ['Date', ...categoricalColumns];

  // Build the lookup once
  const timeSeriesTable = sortBy(makeWide(returnValue), categoricalColumns);

  // const lookup: Record<string, Record<string, string | number>> = {};

  const lookupTable = buildNestedLookup(
    timeSeriesTable,
    categoricalColumnsWithDate,
    numericalColumns
  );

  const lookupPerNumericalColumn = numericalColumns.map((col) =>
    buildNestedLookup(timeSeriesTable, categoricalColumns, numericalColumns)
  );

  const tableWithGroupInfo = addGroupingInfo(
    timeSeriesTable,
    categoricalColumns
  );

  return {
    getValue: (
      categoricalValues: Array<string | number>,
      valueColumn: string
    ) => getValue(lookupTable, categoricalValues, valueColumn),
    uniqueDates,
    categoricalColumns,
    numericalColumns,
    lookupTable: lookupPerNumericalColumn,
    table: timeSeriesTable,
    tableWithGroupInfo,
  };
}

function makeWide(
  table: Record<string, Array<number | string>>
): Array<Record<string, number | string>> {
  const rows: Array<Array<[string, number | string]>> = [];
  let first = true;
  for (const [key, values] of Object.entries(table)) {
    if (!key || !values) {
      continue;
    }
    // eslint-disable-next-line no-loop-func
    values.forEach((value, index) => {
      if (first) {
        rows.push([[key, value]]);
      } else {
        const row = rows[index];
        row.push([key, value]);
      }
    });
    first = false;
  }
  return rows.map((row) => Object.fromEntries(row));
}

function toPlotColumn(
  type: SerializedType,
  column: Array<Result.OneResult>
): Array<number | string> | null {
  if (type.kind === 'number') {
    return (column as Array<DeciNumber>).map((f) => {
      const [rounded] = safeNumberForPrecision(
        Unit.convertToMultiplierUnit(f, type.unit)
      );
      return rounded;
    });
  }
  if (type.kind === 'date') {
    return (column as Array<bigint>).map((d) => formatResult('en-US', d, type));
  }
  if (type.kind === 'boolean') {
    return (column as Array<boolean>).map((d) => (d ? 'True' : 'False'));
  }
  if (type.kind === 'string') {
    return column as Array<string>;
  }
  return null;
}

type Row = Record<string, any>;

type NestedLookup = Record<string, any>;

/**
 * Build a nested lookup table from categorical columns and value columns.
 * The leaf nodes will contain an object mapping each value column to its value.
 *
 * @param data - Array of row objects
 * @param categoricalColumns - Array of column names that define the hierarchy
 * @param valueColumns - Array of column names to store as values at the leaf level
 *
 * Example:
 * categoricalColumns = ["date", "project", "task", "staffMember"]
 * valueColumns = ["hours", "billableAmount"]
 *
 * If we have:
 * { date:"2024-12", project:"Project A", task:"Programming", staffMember:"Bruno", hours:10, billableAmount:200 }
 * { date:"2024-12", project:"Project A", task:"Programming", staffMember:"Alice", hours:5,  billableAmount:100 }
 * { date:"2024-12", project:"Project A", task:"Design",      staffMember:"Bruno", hours:8,  billableAmount:160 }
 *
 * The lookup would look like:
 * {
 *   "2024-12": {
 *     "Project A": {
 *       "Programming": {
 *         "Bruno": { hours: 10, billableAmount: 200 },
 *         "Alice": { hours: 5,  billableAmount: 100 }
 *       },
 *       "Design": {
 *         "Bruno": { hours: 8,  billableAmount: 160 }
 *       }
 *     }
 *   }
 * }
 */
function buildNestedLookup(
  data: Row[],
  categoricalColumns: string[],
  valueColumns: string[]
): NestedLookup {
  const lookup: NestedLookup = {};

  data.forEach((row) => {
    let currentLevel = lookup;
    // Navigate or build hierarchy
    for (let i = 0; i < categoricalColumns.length; i++) {
      const keyValue = String(row[categoricalColumns[i]]);
      if (currentLevel[keyValue] === undefined) {
        // If this is the last categorical column, initialize with a leaf object
        currentLevel[keyValue] = i === categoricalColumns.length - 1 ? {} : {};
      }
      currentLevel = currentLevel[keyValue];
    }

    // At the leaf level, assign value columns
    for (const valCol of valueColumns) {
      currentLevel[valCol] = row[valCol];
    }
  });

  return lookup;
}

/**
 * Retrieve a value from the nested lookup structure.
 *
 * @param lookup - The nested lookup built by `buildNestedLookup`.
 * @param categoricalKeys - The keys that navigate to the leaf (one per categorical column).
 * @param valueColumn - The name of the value column to retrieve from the leaf.
 * @returns The value found at that leaf for the given valueColumn, or undefined if not found.
 */
function getValue(
  lookup: NestedLookup,
  categoricalKeys: (string | number)[],
  valueColumn: string
): any {
  let currentLevel: any = lookup;
  for (const key of categoricalKeys) {
    if (currentLevel && key in currentLevel) {
      currentLevel = currentLevel[key];
    } else {
      return undefined;
    }
  }

  // currentLevel should now be a leaf object containing valueColumns
  return currentLevel ? currentLevel[valueColumn] : undefined;
}

/**
 * Recursively counts the number of leaf nodes in a nested lookup object.
 * A leaf node is defined as a node that is not an object, or is null/undefined,
 * or is any primitive (number, string, boolean).
 *
 * @param obj - The nested lookup object to count leaves in.
 * @returns The count of leaf values.
 */
export function countLeaves(obj: any): number {
  // If obj is null/undefined or not an object, it's a leaf.
  if (obj === null || typeof obj !== 'object') {
    return 1;
  }

  // If it's an object, we need to count all leaves of its children.
  // We assume it's always a dictionary-like object.
  let total = 0;
  for (const key of Object.keys(obj)) {
    total += countLeaves(obj[key]);
  }
  return total;
}

type NestedObject = { [key: string]: any };

interface NodeInfo {
  path: string[];
  key: string;
  value: any | null;
  childrenCount: number;
}

/**
 * Checks if the given node is a leaf node.
 * In this context, a leaf is defined as an object with a single property like { Hours: 2 }
 * or { BillableAmount: 456 }, with no further nested objects.
 */
function isLeafNode(node: any): boolean {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    const keys = Object.keys(node);
    // If it has exactly one key and that key's value is a primitive, we consider it leaf.
    if (keys.length === 1 && typeof node[keys[0]] !== 'object') {
      return true;
    }
  }
  return false;
}

function addGroupingInfo(data: Row[], categoricalKeys: string[]): Row[] {
  // To store the final result
  const result: Row[] = [];

  // We also need to pre-calculate how many rows form each group before we start assigning spans.
  // We'll do a two-pass approach:
  // 1. First pass: Identify group spans for all rows for each categorical level.
  // 2. Second pass: Assign the spans and flags.

  // First, create a structure to store spans at each level:
  // spansByIndex[level][rowIndex] = {count: number, isFirst: boolean}
  type SpanInfo = { count: number; isFirst: boolean };
  const spansByLevel: SpanInfo[][] = categoricalKeys.map(() =>
    data.map(() => ({ count: 0, isFirst: false }))
  );

  // We'll go level by level and assign spans.
  // Approach: For each categorical key (from left to right),
  // group consecutive rows with the same value at that key (taking into account all previous keys).
  // This is a hierarchical grouping: Date -> Project -> Staff in this example.

  // A helper function to generate a grouping key up to a certain level:
  const getGroupingKey = (row: Row, level: number): string => {
    return categoricalKeys
      .slice(0, level + 1)
      .map((k) => row[k])
      .join('|||');
  };

  // For each level of grouping:
  for (let level = 0; level < categoricalKeys.length; level++) {
    let startIndex = 0;
    let currentGroupKey = getGroupingKey(data[0], level);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const groupKey = getGroupingKey(row, level);

      if (groupKey !== currentGroupKey) {
        // The group ended at i-1
        const groupLength = i - startIndex;
        // Mark the group span info
        spansByLevel[level][startIndex].count = groupLength;
        spansByLevel[level][startIndex].isFirst = true;
        // Move to next group
        startIndex = i;
        currentGroupKey = groupKey;
      }
    }

    // Don't forget the last group at this level
    const lastGroupLength = data.length - startIndex;
    spansByLevel[level][startIndex].count = lastGroupLength;
    spansByLevel[level][startIndex].isFirst = true;
  }

  // Now we have span information for each level. Let's merge it into the final result.
  for (let i = 0; i < data.length; i++) {
    const row = { ...data[i] };

    // Attach the span info for each categorical key
    for (let level = 0; level < categoricalKeys.length; level++) {
      const key = categoricalKeys[level];
      if (spansByLevel[level][i].isFirst) {
        row[`${key}Span`] = spansByLevel[level][i].count;
        row[`${key}IsFirst`] = true;
      } else {
        // Not first of its kind, we don't set count or isFirst
      }
    }

    result.push(row);
  }

  return result;
}

export function getChildAtLevel(
  child: DataGroup,
  index: number,
  level: number
) {
  let currentChild = child;

  for (let i = 0; i < level; i++) {
    if (
      !currentChild ||
      !currentChild.children ||
      currentChild.children[index] === undefined
    ) {
      return undefined; // Return undefined if the child at the specified index doesn't exist
    }
    currentChild = currentChild.children[index];
  }

  return currentChild;
}

type Child = { children: Child[] };

export function countChildren(child: Child): number {
  // Base case: If no children, this is a leaf node
  if (!child.children || child.children.length === 0) {
    return 1;
  }

  // Recursive case: Sum the count of children for each child node
  return child.children.reduce(
    (count, childNode) => count + countChildren(childNode),
    0
  );
}
