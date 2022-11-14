import { SmartRefDragCallback } from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { DragHandle } from '../../icons/DragHandle/DragHandle';
import {
  cssVar,
  mouseMovingOverTransitionDelay,
  p14Bold,
  shortAnimationDuration,
} from '../../primitives';
import { CodeResult } from '../CodeResult/CodeResult';

interface NumberProps {
  name: string;
  blockId: string;
  onDragStart: SmartRefDragCallback;
}

export const NumberCatalogItem = ({
  name,
  blockId,
  onDragStart,
}: NumberProps) => {
  const undebouncedResult = useComputer().getBlockIdResult$.use(blockId);

  const result = useDelayedValue(
    undebouncedResult,
    undebouncedResult?.result == null
  );

  if (!result?.result) {
    return null;
  }

  const asText = formatResultPreview(result.result);

  return (
    <div css={gridWrapperStylesForNumberCat}>
      <div
        css={numberItemStyles}
        draggable
        onDragStart={onDragStart({ blockId, asText })}
      >
        <span css={varNameStyles}>{name}</span>{' '}
        <span css={resultStyles}>
          <CodeResult {...result.result} />
        </span>
      </div>
      <div css={dragHandleGridStyles}>
        <span data-drag-handle css={dragHandleStyles}>
          <DragHandle />
        </span>
      </div>
    </div>
  );
};

const gridWrapperStylesForNumberCat = css({
  display: 'grid',
  borderTop: `1px solid ${cssVar('strongHighlightColor')}`,
  gridTemplateColumns: 'repeat(8, 1fr)',
  gap: '1px',
  maxHeight: '40px',
  gridAutoColumns: 'minmax(auto, 20px)',
});

const numberItemStyles = css({
  ...p14Bold,
  padding: '11px 0px 9px 15px',
  display: 'flex',
  cursor: 'grab',
  gridColumn: '1 / 8',
  gridRow: '1',
});

const varNameStyles = css({
  ...p14Bold,
  textAlign: 'left',
  verticalAlign: 'top',
  color: cssVar('strongTextColor'),
});

const resultStyles = css({
  textAlign: 'left',
  verticalAlign: 'top',
  pointerEvents: 'none',
  margin: '0 4px',
  width: '100%',
  textOverflow: 'ellipsis',
  flexShrink: '0',
  overflowX: 'hidden',
  color: cssVar('magicNumberTextColor'),
});

const dragHandleGridStyles = css({
  gridColumn: '8',
  gridRow: 1,
  display: 'flex',
  margin: 'auto',
});

const dragHandleStyles = css({
  opacity: 0,
  height: '20px',
  width: '20px',
  borderRadius: 4,
  padding: '5px',
  transition: `opacity ${shortAnimationDuration} ease-in-out ${mouseMovingOverTransitionDelay}`,
  backgroundColor: cssVar('highlightColor'),
  ':hover': {
    opacity: 1,
    cursor: 'grab',
  },
});
