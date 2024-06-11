import { type Result } from '@decipad/remote-computer';
import type { AnyElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { Select, SmartColumnCell as UISmartColumnCell } from '@decipad/ui';
import type { DragEvent, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EMPTY } from 'rxjs';
import type { Path } from 'slate';
import { type AggregationType } from '@decipad/language-aggregations';
import { useColumnAggregationTypes } from '../../hooks';
import { onDragSmartCellResultStarted } from './onDragSmartCellResultStarted';
import { useOnDragEnd } from '../../../../editor-components/src/utils/useDnd';
import type { TableColumn } from '../../types';
import { useComputer } from '@decipad/editor-hooks';

interface SmartColumnCellProps {
  tableName: string;
  tablePath?: Path;
  column: TableColumn;
  columnIndex: number;
  readonly selectedAggregationTypeName: string | undefined;
  readonly onAggregationTypeNameChange: (
    aggTypeName: string | undefined
  ) => void;
  readonly element: AnyElement;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  tableName,
  tablePath,
  column,
  columnIndex,
  selectedAggregationTypeName,
  onAggregationTypeNameChange,
  element,
}) => {
  const editor = useMyEditorRef();
  const [selectedAggregationType, setSelectedAggregationType] = useState<
    AggregationType | undefined
  >();
  const availableAggregationTypes = useColumnAggregationTypes({
    column,
    tablePath,
    columnIndex,
  });

  const [result, setResult] = useState<Result.Result | null>(null);

  useEffect(() => {
    const aggType =
      (selectedAggregationTypeName != null &&
        availableAggregationTypes?.find(
          (agg) => agg.id === selectedAggregationTypeName
        )) ||
      undefined;
    setSelectedAggregationType(aggType);
  }, [availableAggregationTypes, selectedAggregationTypeName]);

  useEffect(() => {
    if (selectedAggregationType == null) {
      setResult(null);
    }
  }, [selectedAggregationType]);

  const expression = useMemo(() => {
    if (column.name && tableName) {
      const columnRef = `${tableName}.${column.name}`;
      return selectedAggregationType?.expression(columnRef, {
        sum: `sum(${columnRef})`,
      });
    }
    return undefined;
  }, [column.name, selectedAggregationType, tableName]);

  // Expression and result
  const computer = useComputer();

  useEffect(() => {
    const sub = (
      (expression && computer.expressionResultFromText$(expression)) ||
      EMPTY
    ).subscribe((r) => {
      if (selectedAggregationType) {
        setResult(r);
      }
    });
    return () => sub.unsubscribe();
  }, [computer, expression, selectedAggregationType]);

  const onDragExpressionStart = useCallback(
    (ev: DragEvent) => {
      expression &&
        result &&
        onDragSmartCellResultStarted(editor)({
          result,
          expression,
        })(ev);
    },
    [editor, expression, result]
  );

  const onDragEnd = useOnDragEnd();

  const showMenu = availableAggregationTypes?.length > 0;

  const onAggregationNameChanged = useCallback(
    (aggName: string | undefined) => {
      if (!aggName) {
        onAggregationTypeNameChange(undefined);
        return;
      }
      const aggType = availableAggregationTypes?.find(
        (agg) => agg.name === aggName
      );
      setSelectedAggregationType(aggType);
      onAggregationTypeNameChange(aggType?.id);
    },
    [availableAggregationTypes, onAggregationTypeNameChange]
  );

  return (
    <UISmartColumnCell
      onDragStart={onDragExpressionStart}
      onDragEnd={onDragEnd}
      result={result || undefined}
      aggregationTypeMenu={
        showMenu && (
          <Select
            key="selectaggregation"
            variant="transparent"
            label={
              <span key="name">
                {(selectedAggregationType &&
                  (selectedAggregationType.shortName ||
                    selectedAggregationType.name)) ||
                  'Calculate'}
              </span>
            }
            options={availableAggregationTypes?.map((agg) => agg.name) ?? []}
            value={selectedAggregationType?.name}
            clear={!!selectedAggregationType}
            onChange={onAggregationNameChanged}
          ></Select>
        )
      }
      element={element}
    />
  );
};
