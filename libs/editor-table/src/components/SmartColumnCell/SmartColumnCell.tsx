import { Result } from '@decipad/computer';
import { AnyElement, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { Select, SmartColumnCell as UISmartColumnCell } from '@decipad/ui';
import {
  DragEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EMPTY } from 'rxjs';
import { Path } from 'slate';
import { useColumnAggregationTypes } from '../../hooks';
import { AggregationType } from '../../utils';
import { onDragSmartCellResultStarted } from './onDragSmartCellResultStarted';
import { useOnDragEnd } from '../../../../editor-components/src/utils/useDnd';
import { TableColumn } from '../../types';

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
  const editor = useTEditorRef();
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
          (agg) => agg.name === selectedAggregationTypeName
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
          computer,
          result,
          expression,
        })(ev);
    },
    [computer, editor, expression, result]
  );

  const onDragEnd = useOnDragEnd();

  const showMenu = availableAggregationTypes?.length > 0;

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
            caretColor="weak"
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
            onChange={onAggregationTypeNameChange}
          ></Select>
        )
      }
      element={element}
    />
  );
};
