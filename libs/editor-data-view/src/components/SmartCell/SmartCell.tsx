import { DragEvent, FC, useCallback } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { css } from '@emotion/react';
import { useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { onDragStartSmartCell } from './onDragStartSmartCell';
import { SmartProps } from '../../types';
import { useOnDragEnd } from '../../../../editor-components/src/utils/useDnd';
import { useAggregation } from '../../hooks/useAggregation';

const emptyCellStyles = css({
  borderBottom: 0,
  padding: 0,
  margin: 0,
});

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
  const editor = useTEditorRef();
  const computer = useComputer();

  const { result, expression } = useAggregation({
    tableName,
    column,
    aggregationType,
    roundings,
    previousColumns,
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

  return result == null || aggregationType == null ? (
    <td data-empty css={emptyCellStyles} />
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
