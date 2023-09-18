/* eslint decipad/css-prop-named-variable: 0 */
import { isTable } from '@decipad/computer';
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { DragHandle } from '../../icons';
import { cssVar, p14Medium } from '../../primitives';
import { CodeResult } from '../CodeResult/CodeResult';

interface NumberProps {
  name: string;
  blockId: string;
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const NumberCatalogItem = ({
  name,
  blockId,
  onDragStart,
  onDragEnd,
}: NumberProps) => {
  const computer = useComputer();
  const undebouncedResult = computer.getBlockIdResult$.use(blockId);

  const result = useDelayedValue(
    undebouncedResult,
    undebouncedResult?.result == null
  );

  if (!result?.result) {
    return null;
  }

  const { type } = result.result;
  const { kind } = type;

  // only display supported types
  if (
    !(
      kind === 'boolean' ||
      kind === 'date' ||
      kind === 'number' ||
      kind === 'string' ||
      kind === 'table'
    )
  ) {
    return null;
  }

  const asText = formatResultPreview(result.result);

  return (
    <div>
      <div
        draggable
        onDragStart={
          onDragStart &&
          onDragStart({
            blockId,
            asText,
            computer,
            result: result.result,
          })
        }
        onDragEnd={onDragEnd}
        css={numberCatalogListItemStyles}
      >
        <span data-drag-handle css={dragHandleStyles}>
          <DragHandle />
        </span>
        <span
          css={css(p14Medium, {
            position: 'relative',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            minWidth: 0,
            display: 'inline-flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          })}
        >
          {name}
          <span
            css={css(p14Medium, {
              color: cssVar('textSubdued'),
            })}
          >
            {isTable(result.result.type) ? (
              'Table'
            ) : result.result.type.kind === 'type-error' ? (
              <CodeResult variant="inline" {...result.result} />
            ) : (
              <CodeResult {...result.result} />
            )}
          </span>
        </span>
      </div>
    </div>
  );
};

const dragHandleStyles = css({
  opacity: 0,
  height: '28px',
  width: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('textHeavy'),
  svg: {
    width: '10px',
    height: '10px',
  },
});

export const numberCatalogListItemStyles = css(p14Medium, {
  padding: '4px 8px 4px 0px',
  borderRadius: '6px',
  display: 'grid',
  gridTemplateColumns: '28px minmax(0, 1fr)',
  alignItems: 'center',
  cursor: 'grab',
  minWidth: 0,
  minHeight: 0,
  '&:hover': {
    backgroundColor: cssVar('backgroundDefault'),
    'span:first-child': {
      opacity: 1,
    },

    'span:last-child > span:last-child': {
      mixBlendMode: 'initial',
      color: cssVar('themeTextSubdued'),
    },
  },
});
