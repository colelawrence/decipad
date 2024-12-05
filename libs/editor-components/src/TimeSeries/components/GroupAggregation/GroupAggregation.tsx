import type { DragEvent, FC } from 'react';
import { useCallback } from 'react';
import { Aggregation } from '@decipad/ui';
import { type AnyElement, useMyEditorRef } from '@decipad/editor-types';
import type { Result } from '@decipad/language-interfaces';
import { onDragStartSmartCell } from '../SmartCell';
import { useComputer } from '@decipad/editor-hooks';
import { useOnDragEnd } from '../../../utils';

interface GroupAggregationProps {
  aggregationType?: string;
  element?: AnyElement;
  aggregationResult: Result.Result | undefined;
  aggregationExpression: string | undefined;
}

export const GroupAggregation: FC<GroupAggregationProps> = ({
  aggregationType,
  element,
  aggregationResult: result,
  aggregationExpression: expression,
}) => {
  const computer = useComputer();
  const editor = useMyEditorRef();

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

  return result ? (
    <Aggregation
      aggregationType={aggregationType}
      result={result}
      element={element}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  ) : null;
};
