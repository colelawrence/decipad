import { useCallback, useEffect, useState } from 'react';
import {
  ELEMENT_DATA_VIEW_TR,
  MyEditor,
  DataViewElement,
} from '@decipad/editor-types';
import { assertElementType, matchNodeType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import {
  useEditorChange,
  useEditorChangeCallback,
} from '@decipad/editor-hooks';
import { SerializedType, AutocompleteName } from '@decipad/computer';
import { findNode, findNodePath } from '@udecode/plate';
import { Path } from 'slate';
import { useDataViewActions, useSortColumns } from '.';
import { AggregationKind, Column } from '../types';
import { useAvailableColumns } from './useAvailableColumns';
import { useSourceTableNames } from './useSourceTableNames';

interface UseDataViewProps {
  editor: MyEditor;
  element: DataViewElement;
}

interface UseDataViewReturnType {
  variableNames: AutocompleteName[];
  tableName?: string;
  onDelete: () => void;
  onInsertColumn: (name: string, serializedType: SerializedType) => void;
  onDeleteColumn: (dataViewHeaderPath: Path) => void;
  onVariableNameChange: (newName: string) => void;
  availableColumns: Column[] | undefined;
  sortedColumns: Column[] | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
  selectedRoundings: Array<string | undefined>;
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

  const computer = useComputer();
  const blockId = element.varName || '';
  const tableName = computer.getSymbolDefinedInBlock$.use(blockId);

  const availableColumns = useAvailableColumns(element.varName ?? '');

  const [sortedColumns, setSortedColumns] = useState<Column[] | undefined>();

  const sortColumns = useSortColumns({
    sortedColumns,
    setSortedColumns,
    availableColumns,
  });

  const selectColumnOrder = useCallback((): number[] | undefined => {
    if (!availableColumns) {
      return;
    }
    const dataViewPath = findNodePath(editor, element);

    if (dataViewPath) {
      const columnRowEntry = findNode(editor, {
        at: dataViewPath,
        match: matchNodeType(ELEMENT_DATA_VIEW_TR),
      });
      if (columnRowEntry) {
        const [columnRow] = columnRowEntry;
        assertElementType(columnRow, ELEMENT_DATA_VIEW_TR);
        const columnHeaders = columnRow.children;
        return columnHeaders
          .map((column) =>
            availableColumns.findIndex(
              (c) => c.name === column.name || c.blockId === column.name
            )
          )
          .filter(greaterOrEqualToZero);
      }
    }
    return undefined;
  }, [availableColumns, editor, element]);

  useEditorChangeCallback(selectColumnOrder, sortColumns, {
    injectObservable: columnChanges$,
    debounceTimeMs: 2000,
  });

  const selectedAggregationTypes = useEditorChange(
    useCallback(
      () => element.children[1]?.children?.map((th) => th.aggregation),
      [element.children]
    )
  );

  const selectedRoundings = useEditorChange(
    useCallback(
      () => element.children[1]?.children?.map((th) => th.rounding),
      [element.children]
    )
  );

  useEffect(() => {
    if (availableColumns) {
      setDataColumns(availableColumns);
    }
  }, [availableColumns, setDataColumns]);

  return {
    variableNames: useSourceTableNames(),
    tableName,
    onDelete,
    onInsertColumn,
    onDeleteColumn,
    onVariableNameChange,
    sortedColumns,
    availableColumns,
    selectedAggregationTypes,
    selectedRoundings,
  };
};
