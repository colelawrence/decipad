import { FC, useCallback } from 'react';
import { css } from '@emotion/react';
import type { Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { organisms } from '../..';
import { ErrorMessage } from '../../atoms';
import { cssVar, p12Medium } from '../../primitives';

const smartCellStyles = css(p12Medium, {
  whiteSpace: 'nowrap',
  textAlign: 'left',
  color: cssVar('weakerTextColor'),
});

const hoverCellStyles = css({
  backgroundColor: cssVar('highlightColor'),
});

const labelStyles = css({
  textTransform: 'capitalize',
});

export interface ColumnAggregation {
  type?: Result.Result['type'];
  value?: Result.Result['value'];
}

export interface SmartRowProps {
  aggregationType?: string;
  aggregation?: ColumnAggregation | Error;
  rowSpan?: number;
  colSpan?: number;
  onHover?: (hover: boolean) => void;
  hover?: boolean;
}

export function SmartCell({
  aggregation = {},
  aggregationType,
  rowSpan = 1,
  colSpan = 1,
  onHover = noop,
  hover = false,
}: SmartRowProps): ReturnType<FC> {
  const onMouseOver = useCallback(() => onHover(true), [onHover]);
  const onMouseOut = useCallback(() => onHover(false), [onHover]);

  if (aggregation instanceof Error) {
    return (
      <td rowSpan={rowSpan} colSpan={colSpan}>
        <ErrorMessage message={aggregation.message}></ErrorMessage>
      </td>
    );
  }
  const { type, value } = aggregation;
  return (
    <td
      css={[smartCellStyles, hover && hoverCellStyles]}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <>
        <span css={labelStyles}>
          {(aggregationType && `${aggregationType}: `) || null}
        </span>
        {type && value && (
          <organisms.CodeResult variant="inline" type={type} value={value} />
        )}
      </>
    </td>
  );
}
