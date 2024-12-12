import {
  useComputer,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type {
  TimeSeriesElement,
  PlateComponent,
  TableCellType,
} from '@decipad/editor-types';
import { ELEMENT_DATA_VIEW_TH, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType, getNodeEntrySafe } from '@decipad/editor-utils';
import { availableAggregations as getAvailableAggregations } from '@decipad/language-aggregations';
import { useDeepMemo } from '@decipad/react-utils';
import { useCallback, useMemo } from 'react';
import { Path } from 'slate';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { DataViewColumnMenu } from 'libs/ui/src/modules/editor/DataViewColumnMenu/DataViewColumnMenu';
import styled from '@emotion/styled';
import { useDataViewNormalizeColumnHeader } from 'libs/editor-components/src/DataView/hooks/useDataViewNormalizeColumnHeader';
import { useDataViewActions } from 'libs/editor-components/src/DataView/hooks';
import { useDataViewContext } from 'libs/editor-components/src/DataView/components/DataViewContext';
import { availableRoundings } from 'libs/editor-components/src/DataView/components/DataViewColumnHeader/availableRoundings';

export const TimeSeriesColumnHeader: PlateComponent<{
  showDelete: boolean;
  overridePath?: Path;
}> = ({ showDelete, element, overridePath }) => {
  assertElementType(element, ELEMENT_DATA_VIEW_TH);

  const editor = useMyEditorRef();
  const computer = useComputer();
  const path = useNodePath(element);

  const { columns } = useDataViewContext();

  const actualPath = overridePath ?? path;
  const timeSeries: TimeSeriesElement | undefined = useMemo(() => {
    const timeSeriesPath = actualPath && Path.parent(Path.parent(actualPath));
    return (
      timeSeriesPath &&
      (getNodeEntrySafe(editor, timeSeriesPath)?.[0] as
        | TimeSeriesElement
        | undefined)
    );
  }, [editor, actualPath]);

  const availableAggregations = useMemo(() => {
    if (!actualPath) {
      // first column: do not present aggregation choices
      return [];
    }
    return getAvailableAggregations(element.cellType as TableCellType);
  }, [element.cellType, actualPath]);

  const onAggregationChange = usePathMutatorCallback(
    editor,
    path,
    'aggregation',
    'TimeSeriesColumnHeader'
  );

  const { onDeleteColumn } = useDataViewActions(editor, timeSeries);

  const handleColumnDelete = useCallback(() => {
    if (actualPath) {
      onDeleteColumn(actualPath);
    }
  }, [onDeleteColumn, actualPath]);

  // roundings
  const roundings = useDeepMemo(
    useCallback(
      () => (element ? availableRoundings(element.cellType) : []),
      [element]
    )
  );
  const onRoundingChange = usePathMutatorCallback(
    editor,
    path,
    'rounding',
    'TimeSeriesColumnHeader'
  );

  const onFilterChange = usePathMutatorCallback(
    editor,
    path,
    'filter',
    'TimeSeriesColumnHeader'
  );

  useDataViewNormalizeColumnHeader(
    editor,
    computer,
    timeSeries?.varName,
    element
  );
  const readOnly = useIsEditorReadOnly();

  return (
    <Inline contentEditable={false}>
      <span>{element.label}</span>

      {!readOnly && (
        <DataViewColumnMenu
          columnName={element.label}
          type={element.cellType}
          selectedAggregation={element.aggregation}
          availableAggregations={availableAggregations}
          onAggregationChange={onAggregationChange}
          availableRoundings={roundings}
          onRoundingChange={onRoundingChange}
          selectedRounding={element.rounding}
          onDeleteColumn={showDelete ? handleColumnDelete : undefined}
          columns={columns}
          columnIndex={actualPath?.at(2)}
          onFilterChange={onFilterChange}
          selectedFilter={element.filter}
        />
      )}
    </Inline>
  );
};

const Inline = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;
