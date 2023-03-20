import type { Result } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { DragEvent, FC, useCallback } from 'react';
import { CodeResult } from '../../organisms';
import { cssVar, p12Medium, p14Medium } from '../../primitives';

const smartCellStyles = css(p14Medium, {
  position: 'relative',
  whiteSpace: 'nowrap',
  textAlign: 'left',
  fontWeight: '700',
});

const smartCellHoverCellStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

const smartCellLabelStyles = css(p12Medium, {
  color: cssVar('weakerTextColor'),
});

const smartCellAlignRightStyles = css({
  textAlign: 'right',
});

const smartCellGlobalStyles = css({
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
  fontWeight: 'bold',
});

const smartCellDraggableStyles = css({
  cursor: 'grab',

  ':active': {
    cursor: 'grabbing',
  },
});

export interface ColumnAggregation {
  type?: Result.Result['type'];
  value?: Result.Result['value'];
}

export interface SmartRowProps {
  aggregationType?: string;
  result?: Result.Result;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  hover?: boolean;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
  element?: AnyElement;
}

export function SmartCell({
  result,
  aggregationType,
  onDragStart,
  onDragEnd,
  rowSpan = 1,
  colSpan = 1,
  onHover = noop,
  hover = false,
  alignRight = false,
  global = false,
  rotate,
  element,
}: SmartRowProps): ReturnType<FC> {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);
  const readOnly = useIsEditorReadOnly();

  return (
    <td
      css={[
        smartCellStyles,
        !readOnly && onDragStart && smartCellDraggableStyles,
        hover && smartCellHoverCellStyles,
        alignRight && smartCellAlignRightStyles,
        !rotate && global && smartCellGlobalStyles,
      ]}
      rowSpan={rowSpan}
      colSpan={colSpan}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <span css={smartCellLabelStyles}>
        {(aggregationType && `${aggregationType}: `) || null}
      </span>
      {result ? (
        <CodeResult variant="inline" {...result} element={element} />
      ) : null}
    </td>
  );
}
