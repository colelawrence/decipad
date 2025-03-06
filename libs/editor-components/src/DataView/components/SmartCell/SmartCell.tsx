import type { DragEvent, FC } from 'react';
import { useCallback } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { css } from '@emotion/react';
import { useMyEditorRef, DRAG_EXPRESSION } from '@decipad/editor-types';
import type { SmartProps } from '../../types';
import { useOnDragEnd } from '../../../utils/useDnd';
import { onDragStartSmartRef } from '@decipad/editor-utils';

const emptyCellStyles = css({
  borderBottom: 0,
  padding: 0,
  margin: 0,
});

export const SmartCell: FC<SmartProps> = ({
  aggregationResult: result,
  aggregationExpression: expression,
  aggregationVariableName,
  aggregationType,
  rowSpan,
  colSpan,
  alignRight,
  global = false,
  rotate,
}: SmartProps) => {
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
    [editor, expression, result, aggregationVariableName]
  );

  const onDragEnd = useOnDragEnd();

  return result == null || aggregationType == null ? (
    <td data-empty css={emptyCellStyles} />
  ) : (
    <UISmartCell
      aggregationType={aggregationType}
      result={result}
      rowSpan={rowSpan}
      colSpan={colSpan}
      alignRight={alignRight}
      global={global}
      rotate={rotate}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
};
