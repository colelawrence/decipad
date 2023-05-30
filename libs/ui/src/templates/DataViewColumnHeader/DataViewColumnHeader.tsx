/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, forwardRef, ReactNode } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../hooks';
import { DragHandle as DragHandleIcon } from '../../icons';
import { DataViewColumnMenu } from '../../molecules';
import { DataViewColumnMenuProps } from '../../molecules/DataViewColumnMenu/DataViewColumnMenu';
import { cssVar } from '../../primitives';

const dragHandleStyles = css({
  width: '8px',
  height: 9,
  transform: 'translateY(50%)',
  display: 'block',
  margin: 'auto 0',
  cursor: 'grab',
  pointerEvents: 'all',
  marginTop: 0,
  mixBlendMode: 'luminosity',
  'svg > rect': {
    fill: 'transparent',
  },
});

const DragHandle = () => {
  return (
    <button css={dragHandleStyles} contentEditable={false}>
      <DragHandleIcon />
    </button>
  );
};

export interface DataViewColumnHeaderProps extends DataViewColumnMenuProps {
  name: string;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  connectDropTarget?: ConnectDropTarget;
  hoverDirection?: 'left' | 'right';
  isOverCurrent?: boolean;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
}

export type Ref = HTMLTableCellElement;

const dataViewColumnHeaderStyles = css({
  '&::before, &::after': {
    display: 'block',
    content: ' attr(aria-placeholder)',
    width: '1px',
    background: 'transparent',
    height: 'calc(100% - 12px)',
    position: 'absolute',
    top: 0,
  },
  borderBottom: '1px solid',
  borderBottomColor: cssVar('evenStrongerHighlightColor'),
});

const dataViewColumnHeaderBorderLeftStyles = css({
  '&::before': {
    background: 'blue',
    translate: '-8px',
  },
});

const dataViewColumnHeaderSelectWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const dataViewColumnHeaderAlignRightStyles = css({
  justifyContent: 'flex-end',
});

const dataViewColumnHeaderGlobalStyles = {
  color: cssVar('weakTextColor'),
  backgroundColor: cssVar('highlightColor'),
};

const dataViewColumnHeaderRotateStyles = css({
  borderColor: cssVar('strongerHighlightColor'),
});

export const DataViewColumnHeader = forwardRef<
  HTMLTableCellElement,
  DataViewColumnHeaderProps
>(function DataViewColumnHeaderWithoutRef(
  {
    name,
    attributes,
    children,
    connectDragSource,
    connectDropTarget,
    hoverDirection,
    isOverCurrent,
    alignRight = false,
    global = false,
    rotate,
    ...rest
  }: DataViewColumnHeaderProps,
  ref
): ReturnType<FC> {
  const refs = useMergedRef(ref, connectDragSource, connectDropTarget);

  const getBorderRightTranslation = () => {
    if (typeof ref !== 'function' && ref && ref.current) {
      return ref.current.offsetWidth - 8;
    }
    return 0;
  };

  const borderRightStyles = css({
    '&::after': {
      background: 'blue',
      translate: getBorderRightTranslation(),
    },
  });

  const readOnly = useIsEditorReadOnly();

  return (
    <th
      {...attributes}
      css={[
        dataViewColumnHeaderStyles,
        isOverCurrent &&
          hoverDirection === 'left' &&
          dataViewColumnHeaderBorderLeftStyles,
        isOverCurrent && hoverDirection === 'right' && borderRightStyles,
        global && dataViewColumnHeaderGlobalStyles,
        rotate && dataViewColumnHeaderRotateStyles,
      ]}
      contentEditable={false}
      ref={refs}
    >
      <div
        // eslint-disable-next-line no-sparse-arrays
        css={[
          dataViewColumnHeaderSelectWrapperStyles,
          alignRight ? dataViewColumnHeaderAlignRightStyles : null,
        ]}
        contentEditable={false}
      >
        {!readOnly && <DragHandle />}
        <span>{name}</span>

        {!readOnly && <DataViewColumnMenu columnName={name} {...rest} />}

        <div contentEditable={false}>{children}</div>
      </div>
    </th>
  );
});
