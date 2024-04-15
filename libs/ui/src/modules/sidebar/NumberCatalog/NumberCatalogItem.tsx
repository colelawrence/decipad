/* eslint decipad/css-prop-named-variable: 0 */
import { isTable, isTableColumn, Result } from '@decipad/remote-computer';
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { DragHandle } from '../../../icons';
import { cssVar, p14Medium } from '../../../primitives';
import { CodeResult } from '../../editor';

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
      kind === 'table' ||
      kind === 'column'
    )
  ) {
    return null;
  }

  const asText = formatResultPreview(result.result);

  const displayResultType = (res: Result.Result) => {
    if (isTable(res.type)) {
      return 'Table';
    }

    if (isTableColumn(res.type)) {
      return 'Column';
    }

    if (res.type.kind === 'type-error') {
      return <CodeResult variant="inline" {...res} />;
    }

    return <CodeResult {...res} />;
  };

  return (
    <div>
      <div
        draggable
        onDragStart={
          onDragStart &&
          onDragStart({
            blockId,
            asText,
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
            {displayResultType(result.result)}
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
    width: '16px',
    height: '16px',
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
    'span:first-of-type': {
      opacity: 1,
    },

    'span:last-child > span:last-child': {
      mixBlendMode: 'initial',
      color: cssVar('themeTextSubdued'),
    },
  },
});
