/* eslint decipad/css-prop-named-variable: 0 */
import { isTable } from '@decipad/computer';
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import { useComputer, useThemeFromStore } from '@decipad/react-contexts';
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { DragHandle, NestIndicator } from '../../icons';
import {
  black,
  boldOpacity,
  cssVar,
  p12Medium,
  p14Medium,
  transparency,
  weakOpacity,
  white,
} from '../../primitives';
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
  const [darkTheme] = useThemeFromStore();

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
        css={numberCatalogListItemStyles(darkTheme)}
      >
        <span
          css={css({
            display: 'inline-flex',
            gap: '6px',
            alignItems: 'center',
            svg: {
              width: '16px',
              height: '16px',
            },
          })}
        >
          <span
            css={css({
              svg: {
                transform: 'translateY(-4px)',
              },
              'svg > path': {
                stroke: cssVar('strongHighlightColor'),
              },
            })}
          >
            <NestIndicator />
          </span>

          <span
            css={css(p14Medium, {
              position: 'relative',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              minWidth: 0,
              display: 'inherit',
            })}
          >
            {name}
            <span
              css={css(p12Medium, {
                marginLeft: '8px',
                alignSelf: 'center',
                color: cssVar('weakTextColor'),
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
        </span>
        <span data-drag-handle css={dragHandleStyles}>
          <DragHandle />
        </span>
      </div>
    </div>
  );
};

const dragHandleStyles = css({
  opacity: 0,
  borderRadius: '4px',
  padding: '5px',
  height: '20px',
  width: '20px',
  display: 'inline-flex',
  backgroundColor: transparency(black, weakOpacity).rgba,
  color: 'black',
  svg: {
    width: '10px',
    height: '10px',
  },
  'svg > path': {
    fill: cssVar('weakTextColor'),
  },
});

export const numberCatalogListItemStyles = (darkTheme: boolean) =>
  css(p14Medium, {
    padding: '11px 0px 9px 0px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 24px',
    alignItems: 'center',
    gap: '8px',
    cursor: 'grab',
    minWidth: 0,
    minHeight: 0,
    '*:hover > &': {
      backgroundColor: transparency(darkTheme ? black : white, 0.5).rgba,
      'span:last-child': {
        opacity: 1,
      },
      span: {
        color: transparency(darkTheme ? white : black, boldOpacity).rgba,
      },
      'span:last-child span': {
        mixBlendMode: 'initial',
        color: cssVar('magicNumberTextColor'),
      },
    },
  });
