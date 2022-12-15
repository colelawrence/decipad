import { useCallback, useEffect, useMemo, useState } from 'react';
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
  useResult,
} from '@decipad/react-contexts';
import { SerializedType, AutocompleteName, Result } from '@decipad/computer';
import { findNode, findNodePath } from '@udecode/plate';
import { Path } from 'slate';
import { dequal } from 'dequal';
import { ResultTable } from 'libs/language/src/interpreter/interpreter-types';
import { useDataViewActions, useSortColumns } from '.';
import { AggregationKind, Columns } from '../types';

interface Column {
  name: string;
  type: SerializedType;
}

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
  availableColumns: Columns | undefined;
  sortedColumns: Columns | undefined;
  selectedAggregationTypes: Array<AggregationKind | undefined>;
}

const greaterOrEqualToZero = (n: number): boolean => n >= 0;

const namesThatLookLikeTablesOnly = (name: AutocompleteName) =>
  name.name.indexOf('.') < 0;

const isTable = (name: AutocompleteName): boolean => name.type.kind === 'table';

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

  const [tableNames, setTableNames] = useState<AutocompleteName[]>([]);

  const computer = useComputer();
  const blockId = element.varName || '';
  const tableName = computer.getSymbolDefinedInBlock$.use(blockId);
  useEffect(() => {
    const sub = computer.getNamesDefined$
      .observeWithSelector((names) =>
        names.filter(isTable).filter(namesThatLookLikeTablesOnly)
      )
      .subscribe(setTableNames);

    return () => sub.unsubscribe();
  }, [computer.getNamesDefined$]);

  const result = useResult(element.varName || '')?.result as
    | Result.Result<'table'>
    | undefined;

  const availableColumns: Columns | undefined = useMemo(() => {
    if (result?.type.kind === 'table' && result.value) {
      return [
        [...result.type.columnNames],
        [...result.type.columnTypes],
        [...(result.value as ResultTable)],
      ];
    }
    return undefined;
  }, [
    result?.type.columnNames,
    result?.type.columnTypes,
    result?.type.kind,
    result?.value,
  ]);

  // sort column names and types according to user preferences

  const [sortedColumns, setSortedColumns] = useState<Columns | undefined>();

  const dataColumns = useMemo((): Column[] | undefined => {
    if (availableColumns) {
      const [names, types] = availableColumns;
      if (types.length !== names.length) {
        throw new Error(
          'Expected column types and names to be of the same length'
        );
      }

      return types.map((type, index) => ({
        type,
        name: names[index],
      }));
    }
    return undefined;
  }, [availableColumns]);

  const [previousDataColumns, setPreviousDataColumns] = useState<
    Column[] | undefined
  >();

  useEffect(() => {
    if (dataColumns && !dequal(previousDataColumns, dataColumns)) {
      setPreviousDataColumns(dataColumns);
      setDataColumns(dataColumns);
    }
  }, [
    availableColumns,
    dataColumns,
    previousDataColumns,
    setDataColumns,
    sortedColumns,
  ]);

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

  const selectedAggregationTypes = useEditorSelector(
    useCallback(
      () => element.children[1]?.children?.map((th) => th.aggregation),
      [element.children]
    )
  );

  return {
    variableNames: tableNames,
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
