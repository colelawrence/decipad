import { FC, useCallback } from 'react';
import { css } from '@emotion/react';
import type { Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { organisms } from '../..';
import { ErrorMessage } from '../../atoms';
import { cssVar, p12Medium, p14Medium } from '../../primitives';

const smartCellStyles = css(p14Medium, {
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
  hover?: boolean;
  alignRight?: boolean;
}

export function SmartCell({
  result,
  aggregationType,
  rowSpan = 1,
  colSpan = 1,
  onHover = noop,
  hover = false,
  alignRight = false,
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
        hover && hoverCellStyles,
        alignRight && alignRightStyles,
      ]}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <>
        <span css={labelStyles}>
          {(aggregationType && `${aggregationType}: `) || null}
        </span>
        {result ? <organisms.CodeResult variant="inline" {...result} /> : null}
      </>
    </td>
  );
}
