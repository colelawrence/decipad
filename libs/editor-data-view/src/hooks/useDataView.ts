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
import { Path } from 'slate';
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
  onInsertColumn: (name: string, serializedType: SerializedType) => void;
  onDeleteColumn: (dataViewHeaderPath: Path) => void;
  onVariableNameChange: (newName: string) => void;
  availableColumns: Columns | undefined;
  sortedColumns: Columns | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
}

const greaterOrEqualToZero = (n: number): boolean => n >= 0;

export const useDataView = ({
  editor,
  element,
}: UseDataViewProps): UseDataViewReturnType => {
  const {
    onDelete,
    onInsertColumn,
    onDeleteColumn,
    onVariableNameChange,
    setDataColumns,
    columnChanges$,
  } = useDataViewActions(editor, element);

  const tableName = element.varName || '';

  const variableNames = useNamesDefinedBefore(element.id, false);

  const result = useResult(element.id)?.result;

  let availableColumns: Columns | undefined;

  if (result?.type.kind === 'table' && result.value) {
    availableColumns = result
      ? [
          [...result.type.columnNames],
          [...result.type.columnTypes],
          [...(result.value as Interpreter.ResultTable)],
        ]
      : [[], [], []];
  }

  // sort column names and types according to user preferences

  const [sortedColumns, setSortedColumns] = useState<Columns | undefined>();

  useEffect(() => {
    if (availableColumns) {
      const [names, types] = availableColumns;
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
  }, [availableColumns, setDataColumns, sortedColumns]);

  const sortColumns = useSortColumns({
    sortedColumns,
    setSortedColumns,
    availableColumns,
  });

  const selectColumnOrder = useCallback((): number[] | undefined => {
    if (!availableColumns) {
      return;
    }
    const tablePath = findNodePath(editor, element);
    const [columnNames] = availableColumns;

    if (tablePath) {
      const columnRowEntry = findNode(editor, {
        at: tablePath,
        match: matchNodeType(ELEMENT_DATA_VIEW_TR),
      });
      if (columnRowEntry) {
        const [columnRow] = columnRowEntry;
        assertElementType(columnRow, ELEMENT_DATA_VIEW_TR);
        const columnHeaders = columnRow.children;
        return columnHeaders
          .map((column) => columnNames.indexOf(column.name))
          .filter(greaterOrEqualToZero);
      }
    }
    return undefined;
  }, [availableColumns, editor, element]);

  useEditorChange(sortColumns, selectColumnOrder, {
    injectObservable: columnChanges$,
  });

  const selectedAggregationTypes = element.children[1].children.map(
    (th) => th.aggregation
  );

  return {
    variableNames,
    tableName,
    onDelete,
    onInsertColumn,
    onDeleteColumn,
    onVariableNameChange,
    sortedColumns,
    availableColumns,
    selectedAggregationTypes,
  };
};
