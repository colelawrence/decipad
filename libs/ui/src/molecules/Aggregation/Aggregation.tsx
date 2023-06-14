/* eslint decipad/css-prop-named-variable: 0 */
import { type FC, type DragEvent, useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { Result } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { antiwiggle, cssVar, p12Medium, wiggle } from '../../primitives';
import { CodeResult } from '../../organisms';

const aggregationStyles = css({
  display: 'block',
  whiteSpace: 'nowrap',
  maxWidth: '166px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const canGrabStyles = css({
  cursor: 'grab',

  ':hover': {
    animation: `${antiwiggle} 0.5s ease-in-out`,
  },

  ':hover:after': {
    backgroundColor: 'blue',
    animation: `${wiggle} 0.5s ease-in-out`,
  },
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

const aggregationLabelStyles = css(p12Medium, {
  color: cssVar('weakerTextColor'),
});

interface AggregationProps {
  aggregationType?: string;
  result?: Result.Result;
  element?: AnyElement;
  onDragStart?: (ev: DragEvent) => void;
  onDragEnd?: (ev: DragEvent) => void;
}

export const Aggregation: FC<AggregationProps> = ({
  aggregationType,
  result,
  element,
  onDragStart,
  onDragEnd,
}) => {
  const [dragging, setDragging] = useState(false);
  const onLocalDragStart = useCallback(
    (ev: DragEvent) => {
      setDragging(true);
      onDragStart?.(ev);
    },
    [onDragStart]
  );

  const onLocalDragEnd = useCallback(
    (ev: DragEvent) => {
      setDragging(false);
      onDragEnd?.(ev);
    },
    [onDragEnd]
  );

  return (
    <output
      draggable
      css={[aggregationStyles, canGrabStyles, dragging && grabbingStyles]}
      onDragStart={onLocalDragStart}
      onDragEnd={onLocalDragEnd}
      contentEditable={false}
    >
      <span css={aggregationLabelStyles}>
        {(aggregationType && `${aggregationType}: `) || null}
      </span>
      {result ? (
        <CodeResult
          tooltip={false}
          variant="inline"
          {...result}
          element={element}
        />
      ) : null}
    </output>
  );
};
