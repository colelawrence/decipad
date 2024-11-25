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
import { FC, HTMLProps, ReactNode } from 'react';
import { assert } from '@decipad/utils';

type NumberProps = {
  name: string;
  blockId: string;
  onDragStart?: SmartRefDragCallback;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: (event: React.MouseEvent) => void;
  isDataTab?: boolean;

  isSelected?: boolean;
  integrationProvider?: ImportElementSource;
};

type NumberCatalogItemWithResultProps = NumberProps & { result: Result.Result };

type NumberCatalogItemStyledProps = HTMLProps<HTMLDivElement> & {
  variableName: string;
  variant: 'draggable' | 'static';
  children?: ReactNode;
};

export const NumberCatalogItemStyled: FC<NumberCatalogItemStyledProps> = ({
  variableName,
  children,
  variant,
  ...props
}) => {
  switch (variant) {
    case 'draggable':
      return (
        <div {...props} css={numberCatalogDraggableItemStyles}>
          <span data-drag-handle css={dragHandleStyles}>
            <DragHandle />
          </span>
          <span css={contentWrapperDraggable}>{children}</span>
        </div>
      );
    case 'static':
      return (
        <div {...props} css={numberCatalogNonDraggableItemStyles}>
          <span css={contentWrapperStatic}>
            <span>{variableName}</span>
            {children}
          </span>
        </div>
      );
  }
};

const NumberCatalogItemWithResult: FC<NumberCatalogItemWithResultProps> = ({
  name,
  blockId,
  result,
  onDragStart,
  onDragEnd,
  onClick,
  integrationProvider,
  isSelected = false,
}) => {
  const controller = useNotebookWithIdState((s) => s.controller);
  assert(controller != null, 'unreachable');

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

  if (!result) {
    return null;
  }

  const { kind } = result.type;

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

  const asText = formatResultPreview(result);

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
    <NumberCatalogItemStyled
      variant="draggable"
      onClick={onClick}
      variableName={name}
      draggable
      onDragStart={
        onDragStart &&
        onDragStart({
          blockId,
          asText,
          result,
        })
      }
      aria-selected={isSelected}
      onDragEnd={onDragEnd}
      data-testid={`number-catalogue-${name}`}
    >
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
        <span className="result">{displayResultType(result)}</span>
      )}
    </NumberCatalogItemStyled>
  );
};

export const NumberCatalogItem: FC<NumberProps> = (props) => {
  const computer = useComputer();
  const undebouncedResult = computer.getBlockIdResult$.use(props.blockId);

  const result = useDelayedValue(
    undebouncedResult,
    undebouncedResult?.result == null
  );

  if (result?.result == null) {
    return null;
  }

  return <NumberCatalogItemWithResult {...props} result={result.result} />;
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

const numberCatalogItemStyles = css({
  padding: '2px 8px 2px 0px',
  borderRadius: '6px',
  display: 'grid',
  alignItems: 'center',
  minWidth: 0,
  minHeight: 0,
});

const numberCatalogDraggableItemStyles = css(numberCatalogItemStyles, {
  cursor: 'grab',

  // 28px is for the drag handle.
  gridTemplateColumns: '28px minmax(0, 1fr)',

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

const numberCatalogNonDraggableItemStyles = css(numberCatalogItemStyles, {
  // This would be made up by the drag handle in the "draggable" variant.
  // But we don't want to create a weird visual difference where,
  // one variant has a gap to the left and the other doesnt.
  marginLeft: '28px',
  cursor: 'pointer',

  gridTemplateColumns: 'minmax(0, 1fr)',
  paddingTop: 8,
  paddingBottom: 8,

  '> span:first-of-type': {
    width: '100%',
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
});

const contentWrapperStatic = css(contentWrapper, {
  '> svg': {
    cursor: 'pointer',
    alignSelf: 'center',
  },
});

const contentWrapperDraggable = css(contentWrapper, {
  '> span:last-of-type': {
    color: cssVar('textSubdued'),
    display: 'inline-grid',
  },
});
