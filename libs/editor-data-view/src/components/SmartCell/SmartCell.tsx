import {
  DragEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { useComputer } from '@decipad/react-contexts';
import { Result, SerializedType } from '@decipad/computer';
import { debounceTime, EMPTY } from 'rxjs';
import { css } from '@emotion/react';
import { textify } from '@decipad/parse';
import { useTEditorRef } from '@decipad/editor-types';
import { maybeAggregate } from '../../utils/maybeAggregate';
import { onDragStartSmartCell } from './onDragStartSmartCell';
import { AggregationKind, PreviousColumns } from '../../types';
import { useOnDragEnd } from '../../../../editor-components/src/utils/useDnd';

const DEBOUNCE_RESULT_MS = 100;

const emptyCellStyles = css({
  borderBottom: 0,
});

interface SmartProps {
  tableName: string;
  column: {
    type: SerializedType;
    value: Result.ColumnLike<Result.Comparable>;
    name: string;
  };
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  roundings: Array<string | undefined>;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  previousColumns: PreviousColumns;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
}

export const SmartCell: FC<SmartProps> = ({
  column,
  tableName,
  aggregationType,
  roundings,
  rowSpan,
  colSpan,
  onHover,
  hover,
  alignRight,
  previousColumns,
  global = false,
  rotate,
}: SmartProps) => {
  const computer = useComputer();
  const editor = useTEditorRef();
  const [result, setResult] = useState<Result.Result | null>(null);

  const expressionFilter = useMemo(() => {
    return (
      (column &&
        previousColumns.reduce((previous, current, index) => {
          const rounding = roundings[index];
          const filterSubject = previous
            ? `${previous}.${current.name}`
            : `${tableName}.${current.name}`;
          const roundedFilterSubject = rounding
            ? `round(${filterSubject}, ${rounding})`
            : filterSubject;
          const escapedValue = textify({
            type: current.type,
            value: current.value as Result.Result['value'],
          });
          return previous === ''
            ? `filter(${tableName}, ${roundedFilterSubject} == ${escapedValue})`
            : `filter(${previous}, ${roundedFilterSubject} == ${escapedValue})`;
        }, '')) ||
      tableName
    );
  }, [column, previousColumns, roundings, tableName]);

  const expression = useMemo(() => {
    return (
      column &&
      expressionFilter &&
      maybeAggregate(
        `${expressionFilter}.${column.name}`,
        column.type,
        aggregationType,
        {
          sum: `sum(${tableName}.${column.name})`,
        }
      )
    );
  }, [aggregationType, column, expressionFilter, tableName]);

  useEffect(() => {
    const sub = (
      (typeof expression === 'string' &&
        expression &&
        computer
          .expressionResultFromText$(expression)
          .pipe(debounceTime(DEBOUNCE_RESULT_MS))) ||
      EMPTY
    ).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, expression]);

  const onDragStart = useCallback(
    (ev: DragEvent) => {
      expression &&
        result &&
        typeof expression === 'string' &&
        onDragStartSmartCell(editor)({ computer, expression, result })(ev);
    },
    [computer, editor, expression, result]
  );

  const onDragEnd = useOnDragEnd();

  return result == null || aggregationType == null ? (
    <td css={emptyCellStyles} />
  ) : (
    <UISmartCell
      aggregationType={aggregationType}
      result={result}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
      alignRight={alignRight}
      global={global}
      rotate={rotate}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};
