import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ELEMENT_POWER_TR,
  MyEditor,
  PowerTableElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  matchNodeType,
  useNamesDefinedBefore,
} from '@decipad/editor-utils';
import { useEditorChange, useExpressionResult } from '@decipad/react-contexts';
import {
  AST,
  Interpreter,
  SerializedType,
  AutocompleteName,
} from '@decipad/computer';
import { findNode, findNodePath } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { usePowerTableActions, useSortColumns } from '.';
import { AggregationKind, Columns } from '../types';

interface UsePowerTableProps {
  editor: MyEditor;
  element: PowerTableElement;
}

interface UsePowerTableReturnType {
  variableNames: AutocompleteName[];
  onDelete: () => void;
  onVariableNameChange: (newName: string) => void;
  sortedColumns: Columns | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
}

export const usePowerTable = ({
  editor,
  element,
}: UsePowerTableProps): UsePowerTableReturnType => {
  const { onDelete, onVariableNameChange, setDataColumns, columnChanges$ } =
    usePowerTableActions(editor, element);

  const variableNames = useNamesDefinedBefore(element.id, false);
  const expression: AST.Expression | undefined = useMemo(
    () =>
      element.varName
        ? {
            type: 'ref',
            args: [element.varName],
          }
        : undefined,
    [element.varName]
  );

  const result = useExpressionResult(expression);

  let data: Interpreter.ResultTable | undefined;
  let columnNames: string[] | undefined;
  let columnTypes: SerializedType[] | undefined;

  if (result?.type.kind === 'table' && result.value) {
    data = result.value as Interpreter.ResultTable;
    columnNames = result?.type.columnNames;
    columnTypes = result?.type.columnTypes;
  }

  useEffect(() => {
    // add missing columns and remove surplus columns from power table
    if (columnTypes && columnNames) {
      const types = columnTypes;
      const names = columnNames;
      if (types.length !== names.length) {
        throw new Error(
          'Expected column types and names to be of the same length'
        );
      }
      setDataColumns(
        types.map((type, index) => ({
          type,
          name: names[index],
        }))
      );
    }
  }, [columnNames, columnTypes, setDataColumns]);

  // sort column names and types according to user preferences

  const [sortedColumns, setSortedColumns] = useState<Columns | undefined>();

  const sortColumns = useSortColumns({
    columnNames,
    columnTypes,
    data,
    sortedColumns,
    setSortedColumns,
  });

  const editorSelector = useCallback((): number[] | undefined => {
    if (!columnTypes || !columnNames) {
      return;
    }
    const tablePath = findNodePath(editor, element);
    if (tablePath) {
      const columnRowEntry = findNode(editor, {
        at: tablePath,
        match: matchNodeType(ELEMENT_POWER_TR),
      });
      if (columnRowEntry) {
        const [columnRow] = columnRowEntry;
        assertElementType(columnRow, ELEMENT_POWER_TR);
        const columnHeaders = columnRow.children;
        return columnHeaders.map((column) =>
          getDefined(columnNames).indexOf(column.name)
        );
      }
    }
    return undefined;
  }, [columnNames, columnTypes, editor, element]);

  useEditorChange(sortColumns, editorSelector, {
    injectObservable: columnChanges$,
  });

  const selectedAggregationTypes = element.children[1].children.map(
    (th) => th.aggregation
  );

  return {
    variableNames,
    onDelete,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
  };
};
