import { DragEvent, FC, useCallback } from 'react';
import { css } from '@emotion/react';
import type { Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { ErrorMessage } from '../../atoms';
import { cssVar, p12Medium, p14Medium } from '../../primitives';
import { CodeResult } from '../../organisms';

const smartCellStyles = css(p14Medium, {
  position: 'relative',
  whiteSpace: 'nowrap',
  textAlign: 'left',
  fontWeight: '700',
});

const hoverCellStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

const labelStyles = css(p12Medium, {
  color: cssVar('weakerTextColor'),
  textTransform: 'capitalize',
});

const alignRightStyles = css({
  textAlign: 'right',
});

const globalStyles = css({
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
  fontWeight: 'bold',
});

const draggableStyles = css({
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
  hover?: boolean;
  alignRight?: boolean;
  global?: boolean;
}

export function SmartCell({
  result,
  aggregationType,
  onDragStart,
  rowSpan = 1,
  colSpan = 1,
  onHover = noop,
  hover = false,
  alignRight = false,
  global = false,
}: SmartRowProps): ReturnType<FC> {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);

  if (result instanceof Error) {
    return (
      <td rowSpan={rowSpan} colSpan={colSpan}>
        <ErrorMessage message={result.message}></ErrorMessage>
      </td>
    );
  }

  return (
    <td
      css={[
        smartCellStyles,
        onDragStart && draggableStyles,
        hover && hoverCellStyles,
        alignRight && alignRightStyles,
        global && globalStyles,
      ]}
      rowSpan={rowSpan}
      colSpan={colSpan}
      draggable
      onDragStart={onDragStart}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <span css={labelStyles}>
        {(aggregationType && `${aggregationType}: `) || null}
      </span>
      {result ? <CodeResult variant="inline" {...result} /> : null}
    </td>
  );
}
