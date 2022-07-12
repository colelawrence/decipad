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
import { atoms, organisms } from '@decipad/ui';
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
  readonly onAggregationTypeChange: (
    aggType: AggregationType | undefined
  ) => void;
}

export const SmartColumnCell: FC<SmartColumnCellProps> = ({
  tableName,
  tablePath,
  column,
  columnIndex,
  selectedAggregationTypeName,
  onAggregationTypeChange,
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

  const onSelectedAggregationChange = useCallback(
    (name: string) => {
      if (!name) {
        setSelectedAggregationType(undefined);
        setResult(null);
        onAggregationTypeChange(undefined);
        return;
      }
      const aggType =
        name && availableAggregationTypes.find((agg) => agg.name === name);
      if (aggType) {
        setSelectedAggregationType(aggType);
        onAggregationTypeChange(aggType);
      }
    },
    [availableAggregationTypes, onAggregationTypeChange]
  );

  useEffect(() => {
    if (selectedAggregationTypeName !== selectedAggregationType?.name) {
      const aggType =
        (selectedAggregationTypeName != null &&
          availableAggregationTypes.find(
            (agg) => agg.name === selectedAggregationTypeName
          )) ||
        undefined;
      setSelectedAggregationType(aggType);
    }
  }, [
    availableAggregationTypes,
    selectedAggregationType?.name,
    selectedAggregationTypeName,
  ]);

  const expression = useMemo(() => {
    const columnRef = `${tableName}.${column.name}`;
    return selectedAggregationType?.expression(columnRef);
  }, [column.name, selectedAggregationType, tableName]);

  // Expression and result
  const computer = useComputer();

  useEffect(() => {
    const sub = (
      (expression && computer.expressionResultFromText$(expression)) ||
      EMPTY
    ).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, expression]);

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
        <span>
          {(selectedAggregationType &&
            (selectedAggregationType.shortName ||
              selectedAggregationType.name)) ||
            'Calculate'}
        </span>,
        <atoms.Select
          variant="transparent"
          caretColor="weak"
          options={availableAggregationTypes?.map((agg) => agg.name) ?? []}
          value={selectedAggregationType?.name}
          onChange={onSelectedAggregationChange}
        ></atoms.Select>,
      ]}
    />
  );
};
