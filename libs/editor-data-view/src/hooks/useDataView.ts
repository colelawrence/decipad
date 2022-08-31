import { useCallback, useEffect, useState } from 'react';
import {
  ELEMENT_DATA_VIEW_TR,
  MyEditor,
  DataViewElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  matchNodeType,
  useNamesDefinedBefore,
} from '@decipad/editor-utils';
import { useEditorChange, useResult } from '@decipad/react-contexts';
import {
  Interpreter,
  SerializedType,
  AutocompleteName,
} from '@decipad/computer';
import { findNode, findNodePath } from '@udecode/plate';
import { getDefined } from '@decipad/utils';
import { useDataViewActions, useSortColumns } from '.';
import { AggregationKind, Columns } from '../types';

interface UseDataViewProps {
  editor: MyEditor;
  element: DataViewElement;
}

interface UseDataViewReturnType {
  variableNames: AutocompleteName[];
  tableName: string;
  onDelete: () => void;
  onVariableNameChange: (newName: string) => void;
  sortedColumns: Columns | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
}

export const useDataView = ({
  editor,
  element,
}: UseDataViewProps): UseDataViewReturnType => {
  const { onDelete, onVariableNameChange, setDataColumns, columnChanges$ } =
    useDataViewActions(editor, element);

  const tableName = element.varName || '';

  const variableNames = useNamesDefinedBefore(element.id, false);

  const result = useResult(element.id)?.result;

  let data: Interpreter.ResultTable | undefined;
  let columnNames: string[] | undefined;
  let columnTypes: SerializedType[] | undefined;

  if (result?.type.kind === 'table' && result.value) {
    data = result.value as Interpreter.ResultTable;
    columnNames = result?.type.columnNames;
    columnTypes = result?.type.columnTypes;
  }

  useEffect(() => {
    // add missing columns and remove surplus columns from data view
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
        match: matchNodeType(ELEMENT_DATA_VIEW_TR),
      });
      if (columnRowEntry) {
        const [columnRow] = columnRowEntry;
        assertElementType(columnRow, ELEMENT_DATA_VIEW_TR);
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
    tableName,
    onDelete,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
  };
};
