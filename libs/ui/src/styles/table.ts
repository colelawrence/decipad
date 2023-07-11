import { SerializedType } from '@decipad/computer';
import { css, CSSObject } from '@emotion/react';
import { cssVar, p14Medium, setCssVar } from '../primitives';
import { isTabularType } from '../utils';

export const tableControlWidth = 20;

export const thMinHeight = 32;
export const tdMinHeight = 36;
export const tdMinWidth = 75;
export const tdMaxWidth = 240;
export const tdVerticalPadding = 8;
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
  borderRadius: '6px 0 0px 6px',
  backgroundColor: cssVar('tableLiveMakeHeaderButton'),
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  ...setCssVar('slashColorLight', 'transparent'),
  ':hover': {
    ...setCssVar('slashColorLight', 'transparent'),
    backgroundColor: cssVar('tableLiveMakeHeaderButtonHover'),
  },
});

export const normalDragHandleStyles = css({
  gridArea: 'handle',
  cursor: 'grab',
  width: '18px',
  height: '18px',
  borderRadius: '6px',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  padding: '5px',
  ':hover': {
    background: cssVar('highlightColor'),
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

  caretColor: cssVar('tableFocusColor'),

  background: cssVar('backgroundColor'),

  minHeight: tdMinHeight,
  minWidth: tdMinWidth + 50,
  whiteSpace: 'break-spaces',
  cursor: 'default',
  verticalAlign: 'middle',
  paddingTop: tdVerticalPadding,
  paddingBottom: tdVerticalPadding,
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
