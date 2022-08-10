import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { ElementType, FC, HTMLAttributes } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useSelected } from 'slate-react';
import { useMergedRef } from '../../hooks';
import {
  blue300,
  cssVar,
  p12Medium,
  p14Medium,
  setCssVar,
} from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

const lineNumberWidth = '22px';

const tdBaseStyles = css(p14Medium, {
  alignItems: 'center',

  background: cssVar('backgroundColor'),

  minHeight: table.tdMinHeight,
  minWidth: table.tdMinWidth,
  maxWidth: table.tdMaxWidth,
  whiteSpace: 'break-spaces',
  cursor: 'default',
  verticalAlign: 'middle',
  paddingTop: table.tdVerticalPadding,
  paddingBottom: table.tdVerticalPadding,
  position: 'relative',
});

const tdPlaceholderStyles = css({
  // Show line numbers on the first cell of each row.
  position: 'relative',
  minWidth: '0',

  '&:first-of-type': {
    paddingLeft: '34px',
  },

  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: 'transparent',

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: `calc(100% - ${lineNumberWidth})`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
  },
});

const tdGridStyles = {};

const editableStyles = css({
  paddingLeft: '12px',
  paddingRight: '12px',
});

const draggableStyles = css({
  userSelect: 'all',
  cursor: 'grab',
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

const tdDisabledStyles = css({
  ...setCssVar('normalTextColor', cssVar('weakerTextColor')),
});

const tdEditableFocusedUnselectedStyles = css({
  cursor: 'text',
  boxShadow: `inset 0 0 0 2px ${blue300.rgb}`,
});

const alignRightStyles = css({
  textAlign: 'right',
});

export interface TableDataProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  alignRight?: boolean;
  isEditable?: boolean;
  isUserContent?: boolean;
  contentEditable?: boolean;
  attributes?: PlateComponentAttributes;
  showPlaceholder?: boolean;
  grabbing?: boolean;
  selected?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  dropTarget?: ConnectDropTarget;
  lastBeforeMoreRowsHidden?: boolean;
}

export const TableData = ({
  as: Component = 'div',
  isEditable = false,
  isUserContent = false,
  attributes,
  showPlaceholder = true,
  draggable,
  grabbing,
  selected,
  collapsed,
  disabled = false,
  dropTarget,
  lastBeforeMoreRowsHidden = false,
  alignRight,
  children,
  ...props
}: TableDataProps): ReturnType<FC> => {
  const existingRef =
    attributes && 'ref' in attributes ? attributes.ref : undefined;
  const tdRef = useMergedRef(existingRef, dropTarget);
  const focused = useSelected();
  const additionalProps = isEditable ? {} : { contentEditable: false };

  return (
    <Component
      {...attributes}
      {...additionalProps}
      ref={tdRef}
      css={[
        isUserContent && editableStyles,
        tdBaseStyles,
        tdGridStyles,
        draggable && draggableStyles,
        grabbing && grabbingStyles,
        isEditable &&
          focused &&
          !selected &&
          collapsed &&
          tdEditableFocusedUnselectedStyles,
        showPlaceholder && tdPlaceholderStyles,
        disabled && tdDisabledStyles,
        alignRight && alignRightStyles,
      ]}
      {...props}
    >
      {children}
    </Component>
  );
};
