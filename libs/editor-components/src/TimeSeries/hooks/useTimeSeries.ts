import type {
  AutocompleteName,
  ErrSpec,
  SerializedType,
} from '@decipad/language-interfaces';
import { useComputer, useEditorChange } from '@decipad/editor-hooks';
import type {
  TimeSeriesElement,
  TimeSeriesFilter,
  MyEditor,
} from '@decipad/editor-types';
import { useResolved } from '@decipad/react-utils';
import { useCallback, useEffect, useMemo } from 'react';
import type { Path } from 'slate';
import type { AggregationKind, Column } from '../types';
import { sortColumns } from '../utils/sortColumns';
import { useAvailableColumns } from './useAvailableColumns';
import { useSourceTableNames } from './useSourceTableNames';
import { useTimeSeriesActions } from './useTimeSeriesActions';

interface UseTimeSeriesProps {
  editor: MyEditor;
  element: TimeSeriesElement;
}

interface UseTimeSeriesReturnType {
  variableNames: AutocompleteName[];
  tableName?: string;
  onDelete: () => void;
  onInsertColumn: (
    name: string,
    label: string,
    serializedType: SerializedType
  ) => void;
  onDeleteColumn: (timeSeriesHeaderPath: Path) => void;
  onVariableNameChange: (newName: string) => void;
  availableColumns: Column[] | undefined;
  sortedColumns: Column[] | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
  selectedRoundings: Array<string | undefined>;
  selectedFilters: Array<TimeSeriesFilter | undefined>;
  error?: string | ErrSpec;
}

const greaterOrEqualToZero = (n: number): boolean => n >= 0;

export const useTimeSeries = ({
  editor,
  element,
}: UseTimeSeriesProps): UseTimeSeriesReturnType => {
  const computer = useComputer();
  const result = computer.getBlockIdResult$.use(`${element.id}_shadow`);

  const error =
    result?.error?.message ??
    (result?.result?.type.kind === 'type-error'
      ? result.result.type.errorCause
      : undefined);

  const {
    onDelete,
    onInsertColumn,
    onDeleteColumn,
    onVariableNameChange,
    setDataColumns,
    columnChanges$,
  } = useTimeSeriesActions(editor, element);

  const blockId = element.varName || '';
  const tableName = computer.getSymbolDefinedInBlock$.use(blockId);

  const availableColumns = useAvailableColumns(element.varName ?? '');

  const columnOrder = useEditorChange(
    useCallback((): number[] | undefined => {
      if (!availableColumns) {
        return;
      }

      return element.children[1].children
        .map((timeSeriesColumn) =>
          availableColumns.findIndex(
            // label is used for newer time-seriess
            (column) =>
              column.name === timeSeriesColumn.label ||
              column.blockId === timeSeriesColumn.name
          )
        )
        .filter(greaterOrEqualToZero);
    }, [availableColumns, element.children]),
    {
      injectObservable: columnChanges$,
      debounceTimeMs: 500,
    }
  );
  const sortedColumns = useResolved<Column[] | undefined>(
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

  const allVariableNames = useSourceTableNames();
  const variableNames = useMemo(
    () => allVariableNames.filter((name) => name.blockId !== element.id),
    [allVariableNames, element.id]
  );

  return useMemo(
    () => ({
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
      error,
    }),
    [
      availableColumns,
      onDelete,
      onDeleteColumn,
      onInsertColumn,
      onVariableNameChange,
      selectedAggregationTypes,
      selectedFilters,
      selectedRoundings,
      sortedColumns,
      tableName,
      variableNames,
      error,
    ]
  );
};
