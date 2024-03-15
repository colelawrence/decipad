import { AutocompleteName, SerializedType } from '@decipad/remote-computer';
import { useEditorChange } from '@decipad/editor-hooks';
import {
  DataViewElement,
  DataViewFilter,
  MyEditor,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { useResolved } from '@decipad/react-utils';
import { useCallback, useEffect, useMemo } from 'react';
import { Path } from 'slate';
import { useDataViewActions } from '.';
import { AggregationKind, Column } from '../types';
import { sortColumns } from '../utils/sortColumns';
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
  onInsertColumn: (
    name: string,
    label: string,
    serializedType: SerializedType
  ) => void;
  onDeleteColumn: (dataViewHeaderPath: Path) => void;
  onVariableNameChange: (newName: string) => void;
  availableColumns: Column[] | undefined;
  sortedColumns: Column[] | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
  selectedRoundings: Array<string | undefined>;
  selectedFilters: Array<DataViewFilter | undefined>;
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

  const columnOrder = useEditorChange(
    useCallback((): number[] | undefined => {
      if (!availableColumns) {
        return;
      }

      return element.children[1].children
        .map((dataViewColumn) =>
          availableColumns.findIndex(
            // label is used for newer data-views
            (column) =>
              column.name === dataViewColumn.label ||
              column.blockId === dataViewColumn.name
          )
        )
        .filter(greaterOrEqualToZero);
    }, [availableColumns, element.children]),
    {
      injectObservable: columnChanges$,
      debounceTimeMs: 500,
    }
  );
  const sortedColumns = useResolved(
    useMemo(
      () => columnOrder && sortColumns(availableColumns, columnOrder),
      [availableColumns, columnOrder]
    )
  );

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

  const selectedFilters = useEditorChange(
    useCallback(
      () => element.children[1]?.children?.map((th) => th.filter),
      [element.children]
    )
  );

  useEffect(() => {
    if (availableColumns) {
      setDataColumns(availableColumns);
    }
  }, [availableColumns, setDataColumns]);

  const variableNames = useSourceTableNames().filter(
    (name) => name.blockId !== element.id
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
    selectedRoundings,
    selectedFilters,
  };
};
