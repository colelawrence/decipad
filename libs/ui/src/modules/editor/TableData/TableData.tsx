/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, HTMLAttributes, forwardRef } from 'react';
import { componentCssVars, cssVar, p12Medium } from '../../../primitives';
import { table } from '../../../styles';
import {
  innerTablesNoBottomBorderStyles,
  innerTablesNoTopBorderStyles,
  tdBaseStyles,
  tdHorizontalPadding,
} from '../../../styles/table';
import { CursorState } from '@decipad/react-contexts';
import { tableRowCounter } from '../../../utils';
import { useMergedRef } from '../../../hooks';

const lineNumberWidth = '22px';

const tdPlaceholderStyles = css({
  // Show line numbers on the first cell of each row.
  position: 'relative',
  minWidth: '0',

  '&:first-of-type': {
    paddingLeft: table.firstTdPaddingLeft,
    '--td-placeholder-width': `${table.firstTdPaddingLeft}px`,
    '--td-no-padding-left': '0px',
  },

  '&:first-of-type::before': {
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

const editableStyles = css({
  paddingLeft: tdHorizontalPadding,
  paddingRight: tdHorizontalPadding,
});

const nonEditableStyles = css({
  backgroundColor: 'transparent',
});

const formulaResultStyles = css({
  backgroundColor: cssVar('backgroundSubdued'),
});

const selectedStyles = ({ isFormulaResult }: { isFormulaResult: boolean }) =>
  css({
    backgroundColor: isFormulaResult
      ? cssVar('backgroundHeavy')
      : componentCssVars('TableSelectionBackgroundColor'),
  });

const ringStyles = (color?: string) =>
  css({
    boxShadow: color && `0 0 0 2px ${color} inset`,
  });

const tdAnchorStyles = ringStyles(componentCssVars('TableFocusColor'));

const cursorStyles = (cursorState: CursorState) =>
  ringStyles(cursorState.data.color?.rgb);

const editingStyles = css({
  filter: componentCssVars('TableEditingShadowFilter'),
  zIndex: 1,
});

// const draggableStyles = css({
//   ':hover': {
//     '.drag-handle': {
//       display: 'block',
//     },
//   },
// });

export interface TableDataProps extends HTMLAttributes<HTMLTableCellElement> {
  as?: 'td' | 'div';
  isUserContent?: boolean;
  isFormulaResult?: boolean;
  attributes?: PlateComponentAttributes;
  showPlaceholder?: boolean;
  selected?: boolean;
  anchor?: boolean;
  cursor?: CursorState;
  editing?: boolean;
  rowSpan?: number;
}

export const TableData = forwardRef(
  (
    {
      as: Component = 'div',
      isUserContent = false,
      isFormulaResult = false,
      attributes,
      showPlaceholder = true,
      selected,
      anchor,
      cursor,
      editing,
      rowSpan,
      children,
      ...props
    }: TableDataProps,
    ref
  ): ReturnType<FC> => {
    const existingRef =
      attributes && 'ref' in attributes ? attributes.ref : undefined;
    const tdRef = useMergedRef(existingRef, ref);

    return (
      <Component
        {...attributes}
        ref={tdRef}
        rowSpan={rowSpan}
        css={[
          isUserContent && editableStyles,
          tdBaseStyles,
          showPlaceholder && tdPlaceholderStyles,
          isFormulaResult && formulaResultStyles,
          selected && selectedStyles({ isFormulaResult }),
          cursor && cursorStyles(cursor),
          anchor && tdAnchorStyles,
          editing && editingStyles,
          !isUserContent && nonEditableStyles,
          // draggable && draggableStyles,
          {
            table: {
              height: '100%',
              // fixme: there's an issue we can't set height to 100%
              // because it's a table inside a td
              ...innerTablesNoTopBorderStyles,
              ...innerTablesNoBottomBorderStyles,
            },
          },
        ]}
        // Used in e2e tests
        data-selected={selected || anchor}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
