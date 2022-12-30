import { useCallback, useEffect, useState } from 'react';
import {
  ELEMENT_DATA_VIEW_TR,
  MyEditor,
  DataViewElement,
} from '@decipad/editor-types';
import { assertElementType, matchNodeType } from '@decipad/editor-utils';
import {
  useComputer,
  useEditorChange,
  useEditorSelector,
} from '@decipad/react-contexts';
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
        return columnHeaders
          .map((column) =>
            availableColumns.findIndex((c) =>
              c.blockId != null
                ? c.blockId === column.name
                : c.name === column.name
            )
          )
          .filter(greaterOrEqualToZero);
      }
    }
    return undefined;
  }, [availableColumns, editor, element]);

  useEditorChange(sortColumns, selectColumnOrder, {
    injectObservable: columnChanges$,
  });

  const selectedAggregationTypes = useEditorSelector(
    useCallback(
      () => element.children[1]?.children?.map((th) => th.aggregation),
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
  };
};
