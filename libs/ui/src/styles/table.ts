import { SerializedType } from '@decipad/computer';
import { css, CSSObject } from '@emotion/react';
import { cssVar, p14Medium, setCssVar } from '../primitives';
import { isTabularType } from '../utils';

export const buttonColumnWidth = '44px';

export const tableControlWidth = '20px';

export const thMinHeight = '32px';
export const thMinWidth = '269px';
export const tdMinHeight = '36px';
export const tdMinWidth = '120px';
export const tdMaxWidth = '240px';
export const tdVerticalPadding = '8px';
export const tdHorizontalPadding = '12px';

export const firstTdPaddingLeft = '34px';

export const smartRowHorizontalPadding = '5px';

export const firstTdLeftPadding = '20px';

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
    : `${tdVerticalPadding} ${tdHorizontalPadding}`,
});

export const defaultMaxRows = 10;

export const tdBaseStyles = css(p14Medium, {
  position: 'relative',
  alignItems: 'center',

  caretColor: cssVar('tableFocusColor'),

  background: cssVar('backgroundColor'),

  minHeight: tdMinHeight,
  minWidth: tdMinWidth,
  maxWidth: tdMaxWidth,
  whiteSpace: 'break-spaces',
  cursor: 'default',
  verticalAlign: 'middle',
  paddingTop: tdVerticalPadding,
  paddingBottom: tdVerticalPadding,
});
