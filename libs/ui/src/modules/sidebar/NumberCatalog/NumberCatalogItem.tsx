/* eslint decipad/css-prop-named-variable: 0 */
import { isTableColumn, Result } from '@decipad/remote-computer';
import { SmartRefDragCallback } from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { DragHandle, Trash } from '../../../icons';
import { cssVar, p14Medium } from '../../../primitives';
import { CodeResult } from '../../editor';
import { useComputer } from '@decipad/editor-hooks';
import { isTable } from '@decipad/computer-utils';
import { Pencil } from '../../../icons/user-icons';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  ImportElementSource,
  ImportElementSourcePretty,
} from '@decipad/editor-types';

interface NumberProps {
  name: string;
  blockId: string;
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (event: React.MouseEvent) => void;
  isDataTab?: boolean;

  isSelected?: boolean;
  integrationProvider?: ImportElementSource;
}

export const NumberCatalogItem = ({
  name,
  blockId,
  onDragStart,
  onDragEnd,
  onClick,
  integrationProvider,
  isSelected = false,
}: NumberProps) => {
  const computer = useComputer();
  const undebouncedResult = computer.getBlockIdResult$.use(blockId);

  const controller = useNotebookWithIdState((s) => s.controller);
  if (controller == null) {
    throw new Error('Controller is null');
  }

  const handleDelete = () => {
    const block = controller.findNodeEntryById(blockId);
    if (block == null) {
      throw new Error('Block is null');
    }

    const [node, path] = block;
    controller.apply({
      type: 'remove_node',
      path,
      node,
    });
  };

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
      if (isFlagEnabled('NAV_SIDEBAR') && integrationProvider) {
        return ImportElementSourcePretty[integrationProvider];
      }
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
    <div onClick={onClick}>
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
        aria-selected={isSelected}
        onDragEnd={onDragEnd}
        css={numberCatalogListItemStyles}
        data-testid={`number-catalogue-${name}`}
      >
        <span data-drag-handle css={dragHandleStyles}>
          <DragHandle />
        </span>
        <span css={contentWrapper}>
          <span css={nameGroupStyles}>
            <span css={combinedStyles}>
              {name}
              {!isSelected && (
                <span css={pencilIconStyles}>
                  <Pencil />
                </span>
              )}
            </span>
          </span>
          {isSelected ? (
            <span css={trashIconStyles} onClick={handleDelete}>
              <Trash />
            </span>
          ) : (
            <span className="result">{displayResultType(result.result)}</span>
          )}
        </span>
      </div>
    </div>
  );
};

const trashIconStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('textHeavy'),
  svg: {
    width: '16px',
    height: '16px',
  },
});

const pencilIconStyles = css({
  opacity: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('textHeavy'),
  svg: {
    width: '16px',
    height: '16px',
  },
  transition: 'opacity 0.2s ease',
});

const nameGroupStyles = css({
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
  '&:hover, &[aria-selected="false"]': {
    [`${pencilIconStyles}`]: {
      display: 'flex',
      opacity: 1,
      cursor: 'pointer',
    },
  },
});

const combinedStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

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

  '&:hover, &[aria-selected="true"]': {
    backgroundColor: cssVar('backgroundDefault'),
    'span:first-of-type': {
      opacity: 1,
    },

    'span.result:last-child > span:last-child': {
      mixBlendMode: 'initial',
      color: cssVar('themeTextSubdued'),
    },
  },

  '&[aria-selected="true"]': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

const contentWrapper = css(p14Medium, {
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  minWidth: 0,
  justifyContent: 'space-between',

  '> span:first-of-type': {
    maxWidth: '200px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: 'inline-block',
  },

  '> span:last-of-type': {
    color: cssVar('textSubdued'),
  },
});
