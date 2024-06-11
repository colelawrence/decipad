import type { DragEvent, FC } from 'react';
import { useCallback } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { css } from '@emotion/react';
import { useMyEditorRef } from '@decipad/editor-types';
import { onDragStartSmartCell } from './onDragStartSmartCell';
import type { SmartProps } from '../../types';
import { useOnDragEnd } from '../../../../editor-components/src/utils/useDnd';
import { useComputer } from '@decipad/editor-hooks';

const emptyCellStyles = css({
  borderBottom: 0,
  padding: 0,
  margin: 0,
});

export const SmartCell: FC<SmartProps> = ({
  aggregationResult: result,
  aggregationExpression: expression,
  aggregationType,
  rowSpan,
  colSpan,
  alignRight,
  global = false,
  rotate,
}: SmartProps) => {
  const editor = useMyEditorRef();
  const computer = useComputer();

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
