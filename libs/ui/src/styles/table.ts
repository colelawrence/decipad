import { SerializedType } from '@decipad/language-interfaces';
import { css, CSSObject } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p14Medium,
  smallScreenQuery,
} from '../primitives';
import { isTabularType } from '../utils';
import { slimBlockWidth, wideBlockWidth } from './editor-layout';
import { deciInsideNotebookOverflowXStyles } from './scrollbars';

export const tableControlWidth = 20;

export const thMinHeight = 32;
export const tdMinHeight = 36;
export const tdMinWidth = 75;
export const tdMaxWidth = 240;
export const tdVerticalPadding = 10;
export const tdHorizontalPadding = 12;

export const firstTdPaddingLeft = 34;

export const smartRowHorizontalPadding = 5;

const halfSlimBlockWidth = `${Math.round(slimBlockWidth / 2)}px`;
const totalWidth = cssVar('editorWidth');
const halfTotalWidth = '50vw';
const wideToSlimBlockWidthDifference = `${wideBlockWidth - slimBlockWidth}px`;
const gutterWidth = '60px';
const leftMargin = `calc(${halfTotalWidth} - ${halfSlimBlockWidth} - ${wideToSlimBlockWidthDifference})`;
const restWidthBlock = `calc(${totalWidth} - ${leftMargin} - ${gutterWidth} - ${gutterWidth})`;

export const cellLeftPaddingStyles = css({
  paddingLeft: tdHorizontalPadding,
  paddingRight: tdHorizontalPadding,
});

export const scrollRightOffset = `(((${cssVar(
  'editorWidth'
)} - 610px) / 2) + ${tableControlWidth}px)`;

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

const editorBlockOffset = 30;
const fullWidthPadding = 60;

// editorBlockOffset contributes additional padding on the right
const fullWidthPaddingLeft = fullWidthPadding;
const fullWidthPaddingRight = fullWidthPadding - editorBlockOffset;

export const tableWrapperTransformStyles = css({
  position: 'relative',
  transform: `translateX(calc((((${cssVar(
    'editorWidth'
  )} - ${slimBlockWidth}px) / 2) + ${tableControlWidth}px) * -1 ))`,
  left: tableControlWidth,
});

export const fullWidthStyles = css(
  deciInsideNotebookOverflowXStyles,
  tableWrapperTransformStyles,
  {
    minWidth: `calc(
    ${cssVar('editorWidth')} -
    ${fullWidthPaddingLeft + fullWidthPaddingRight}px
  )`,
    paddingRight: '16px',
  }
);

export const tableWrapperDraggingStyles = css({
  left: `-${tableControlWidth}px`,
});

export const tableWrapperDefaultStyles = css(
  deciInsideNotebookOverflowXStyles,
  {
    width: cssVar('editorWidth'),
    minWidth: slimBlockWidth,
    overflowY: 'hidden',
    position: 'relative',
    whiteSpace: 'nowrap',
    display: 'flex',
    [smallScreenQuery]: {
      maxWidth: cssVar('editorWidth'),
      transform: `translateX(-40px)`,
      minWidth: '0',
    },
  }
);

export const tableCaptionWrapperStyles = css({
  width: '100%',
  minWidth: slimBlockWidth,
  maxWidth: restWidthBlock,
  display: 'inline-block',
  [smallScreenQuery]: {
    maxWidth: cssVar('editorWidth'),
    minWidth: '0',
  },
});

export const tableWrapperStyles = css([
  tableWrapperTransformStyles,
  tableWrapperDefaultStyles,
]);

export const tableScroll = css({
  paddingRight: `calc(${scrollRightOffset})`,
  [smallScreenQuery]: {
    paddingRight: '0px',
  },
});

export const tableOverflowStyles = css({
  display: 'inline-block',
  height: '20px',
  minWidth: `calc(((${cssVar(
    'editorWidth'
  )} - ${slimBlockWidth}px) / 2) - ${tableControlWidth}px)`,
  '@media print': {
    minWidth: 'auto',
  },
});

export const tableAddColumnButtonWrapperStyles = css({
  // this is deliberately coded like this
  // to prevent a unfixable rogue cursor from slate
  // that otherwise would render
  paddingRight: 400,
  width: '32px',
  minWidth: '32px',
  paddingLeft: '8px',
  position: 'relative',
  marginLeft: `calc(${scrollRightOffset} *-1)`,
  [smallScreenQuery]: {
    marginLeft: '0px',
  },
});
