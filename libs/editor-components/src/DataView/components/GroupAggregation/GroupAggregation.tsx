import type { DragEvent, FC } from 'react';
import { useCallback } from 'react';
import { Aggregation } from '@decipad/ui';
import {
  type AnyElement,
  useMyEditorRef,
  DRAG_EXPRESSION,
} from '@decipad/editor-types';
import type { Result } from '@decipad/language-interfaces';
import { useOnDragEnd } from '../../../utils';
import { onDragStartSmartRef } from '@decipad/editor-utils';

interface GroupAggregationProps {
  aggregationType?: string;
  element?: AnyElement;
  aggregationResult: Result.Result | undefined;
  aggregationExpression: string | undefined;
  aggregationVariableName: string | undefined;
}

export const GroupAggregation: FC<GroupAggregationProps> = ({
  aggregationType,
  element,
  aggregationResult: result,
  aggregationExpression: expression,
  aggregationVariableName,
}) => {
  const editor = useMyEditorRef();

  const onDragStart = useCallback(
    (ev: DragEvent) => {
      result &&
        onDragStartSmartRef(editor)({
          dragType: DRAG_EXPRESSION,
          result,
          expression,
          variableName: aggregationVariableName,
        })(ev);
    },
    [editor, result, expression, aggregationVariableName]
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
