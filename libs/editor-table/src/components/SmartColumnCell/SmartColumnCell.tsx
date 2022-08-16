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
import { organisms } from '@decipad/ui';
import { useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { Result } from '@decipad/computer';
import { TableColumn, useColumnAggregationTypes } from '../../hooks';
import { AggregationType } from '../../utils';
import { onDragSmartCellResultStarted } from './onDragSmartCellResultStarted';

interface SmartColumnCellProps {
  tableName: string;
  tablePath?: Path;
  column: TableColumn;
  columnIndex: number;
  readonly selectedAggregationTypeName: string | undefined;
  readonly onAggregationTypeNameChange: (
    aggTypeName: string | undefined
  ) => void;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  tableName,
  tablePath,
  column,
  columnIndex,
  selectedAggregationTypeName,
  onAggregationTypeNameChange,
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
    if (column.name) {
      const columnRef = `${tableName}.${column.name}`;
      return selectedAggregationType?.expression(columnRef);
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
      expression && onDragSmartCellResultStarted(editor)(expression)(ev);
    },
    [editor, expression]
  );

  return (
    <organisms.SmartColumnCell
      onDragStart={onDragExpressionStart}
      result={result || undefined}
      aggregationTypeMenu={[
        <span key="name">
          {(selectedAggregationType &&
            (selectedAggregationType.shortName ||
              selectedAggregationType.name)) ||
            'Calculate'}
        </span>,
        <organisms.Select
          key="selectaggregation"
          variant="transparent"
          caretColor="weak"
          options={availableAggregationTypes?.map((agg) => agg.name) ?? []}
          value={selectedAggregationType?.name}
          clear={!!selectedAggregationType}
          onChange={onAggregationTypeNameChange}
        ></organisms.Select>,
      ]}
    />
  );
};
