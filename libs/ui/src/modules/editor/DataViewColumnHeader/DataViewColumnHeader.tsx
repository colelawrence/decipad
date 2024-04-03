/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css, SerializedStyles } from '@emotion/react';
import { FC, forwardRef, PropsWithChildren, ReactNode } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { useMergedRef } from '../../../hooks';
import { DragHandle as DragHandleIcon } from '../../../icons';

import {
  DataViewColumnMenuProps,
  DataViewColumnMenu,
} from '../DataViewColumnMenu/DataViewColumnMenu';
import { componentCssVars, cssVar } from '../../../primitives';
import { useIsHovering } from '@decipad/react-utils';
import { getTypeIcon } from '../../../utils';

const dragHandleStyles = css({
  display: 'block',
  pointerEvents: 'all',
  height: 16,
  width: 16,

  svg: {
    width: 16,
    height: 16,
    margin: 'auto',
  },
  'svg > rect': {
    fill: 'transparent',
  },
});

const smallerDragHandleStyles = css({
  display: 'block',
  pointerEvents: 'all',
  height: 2,
  width: 16,

  svg: {
    width: 9,
    height: 9,
    margin: 'auto',
    transform: 'translateY(-45%)',
  },
  'svg > rect': {
    fill: 'transparent',
  },
});

const DragHandle: FC<
  PropsWithChildren<{ overrideStyles?: SerializedStyles }>
> = ({ children, overrideStyles = dragHandleStyles }) => {
  return (
    <button css={overrideStyles} contentEditable={false}>
      {children}
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
    width: '2px',
    background: 'transparent',
    height: 'calc(100% - 12px)',
    position: 'absolute',
    top: 0,
  },
  borderBottom: '1px solid',
  borderBottomColor: cssVar('borderDefault'),
});

const dataViewColumnHeaderBorderLeftStyles = css({
  '&::before': {
    background: componentCssVars('DroplineColor'),
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
  color: cssVar('textSubdued'),
  backgroundColor: cssVar('backgroundDefault'),
};

const dataViewColumnHeaderRotateStyles = css({
  borderColor: cssVar('borderSubdued'),
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
      background: componentCssVars('DroplineColor'),
      translate: getBorderRightTranslation(),
    },
  });

  const readOnly = useIsEditorReadOnly();

  const { isHovering, onMouseEnter, onMouseLeave } = useIsHovering();
  const Icon = getTypeIcon(rest.type);

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        // eslint-disable-next-line no-sparse-arrays
        css={[
          dataViewColumnHeaderSelectWrapperStyles,
          alignRight ? dataViewColumnHeaderAlignRightStyles : null,
        ]}
        contentEditable={false}
      >
        {!readOnly && (
          <DragHandle
            overrideStyles={
              isHovering ? smallerDragHandleStyles : dragHandleStyles
            }
          >
            {isHovering ? <DragHandleIcon /> : <Icon />}
          </DragHandle>
        )}
        <span>{name}</span>

        {!readOnly && <DataViewColumnMenu columnName={name} {...rest} />}

        <div contentEditable={false}>{children}</div>
      </div>
    </th>
  );
});
