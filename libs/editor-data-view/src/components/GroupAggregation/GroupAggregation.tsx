import { useCallback } from 'react';
import type { FC, DragEvent } from 'react';
import { Aggregation } from '@decipad/ui';
import { AnyElement, useTEditorRef } from '@decipad/editor-types';
import { SerializedType } from '@decipad/computer';
import { ColumnLike, Comparable } from '@decipad/column';
import { useOnDragEnd } from '@decipad/editor-components';
import { useComputer } from '@decipad/react-contexts';
import { useAggregation } from '../../hooks/useAggregation';
import { PreviousColumns } from '../../types';
import { onDragStartSmartCell } from '../SmartCell';

interface GroupAggregationProps {
  tableName: string;
  aggregationType?: string;
  element?: AnyElement;
  column?: {
    type: SerializedType;
    value: ColumnLike<Comparable>;
    name: string;
  };
  previousColumns: PreviousColumns;
  roundings: Array<string | undefined>;
}

export const GroupAggregation: FC<GroupAggregationProps> = ({
  tableName,
  aggregationType,
  element,
  column,
  previousColumns,
  roundings,
}) => {
  const computer = useComputer();
  const editor = useTEditorRef();

  const { result, expression } = useAggregation({
    tableName,
    aggregationType,
    column,
    previousColumns,
    roundings,
  });

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

  return (
    result && (
      <Aggregation
        aggregationType={aggregationType}
        result={result}
        element={element}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    )
  );
};
