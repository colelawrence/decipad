import { SerializedType } from '@decipad/language-interfaces';
import { css, CSSObject } from '@emotion/react';
import { componentCssVars, cssVar, p14Medium } from '../primitives';
import { isTabularType } from '../utils';
import { slimBlockWidth } from './editor-layout';
import { noTrackScrollbarStyles } from './scrollbars';

export const tableControlWidth = 20;

export const thMinHeight = 32;
export const tdMinHeight = 36;
export const tdMinWidth = 75;
export const tdMaxWidth = 240;
export const tdVerticalPadding = 10;
export const tdHorizontalPadding = 12;

export const firstTdPaddingLeft = 34;

export const smartRowHorizontalPadding = 5;

export const cellLeftPaddingStyles = css({
  paddingLeft: tdHorizontalPadding,
  paddingRight: tdHorizontalPadding,
});

export const tableParentStyles = css({
  padding: 0,
  overflow: 'hidden',
  table: {
    width: '100%',
  },
});

export const importTableDragHandleStyles = css({
  gridArea: 'handle',
  cursor: 'pointer',
  width: '18px',
  height: '18px',
  borderRadius: '4px',

  ':focus, :active': {
    boxShadow: `0 0 0 1px ${componentCssVars('TableFocusColor')}`,
  },
});

export const normalDragHandleStyles = css({
  gridArea: 'handle',
  cursor: 'grab',
  width: '18px',
  height: '18px',
  borderRadius: '6px',
  padding: '2px',

  ':hover': {
    background: cssVar('backgroundDefault'),
  },
});

export const getCellWrapperStyles = (type: SerializedType): CSSObject => ({
  padding: isTabularType(type)
    ? undefined
    : `${tdVerticalPadding}px ${tdHorizontalPadding}px`,
});

export const defaultMaxRows = 10;

export const tdBaseStyles = css(p14Medium, {
  position: 'relative',
  alignItems: 'center',

  caretColor: componentCssVars('TableFocusColor'),

  background: cssVar('backgroundMain'),

  minHeight: tdMinHeight,
  minWidth: tdMinWidth + 50,
  whiteSpace: 'break-spaces',
  cursor: 'default',
  verticalAlign: 'middle',
  paddingTop: tdVerticalPadding,
  paddingBottom: tdVerticalPadding,

  '> *': {
    minHeight: '1lh',
  },
});

export const innerTablesNoTopBorderStyles = {
  borderTop: 0,
  borderTopLeftRadius: '0 !important',
  borderTopRightRadius: '0 !important',
};

export const innerTablesNoBottomBorderStyles = {
  borderBottom: 0,
  borderBottomLeftRadius: '0 !important',
  borderBottomRightRadius: '0 !important',
};

/**
 * Used when you want a full width element, but want it to initially appear centered.
 */
export const leftPadding = `calc((${slimBlockWidth}px - ${cssVar(
  'editorWidth'
)}) / -2)`;

export const fullWidthHorizontalScrollable = css(noTrackScrollbarStyles, {
  gridRow: '3',
  gridColumn: '1 / span 5',
  paddingLeft: leftPadding,
  overflowX: 'auto',
  paddingRight: '16px',
});
