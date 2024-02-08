import { css } from '@emotion/react';
import { cssVar } from '../primitives';
import { slimBlockWidth } from './editor-layout';

export const defaultScrollbarWidth = 8;

export const noTrackScrollbarStyles = css({
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  },
  '&::-webkit-scrollbar': {
    backgroundColor: 'transparent',
    width: defaultScrollbarWidth,
    height: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
    borderRadius: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },

  '&::-ms-scrollbar-thumb': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: defaultScrollbarWidth,
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
  },
});

export const insideNotebookScrollbarStyles = css({
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  },
  '&::-webkit-scrollbar': {
    width: '100px',
    height: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: 'transparent',
    borderRadius: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-webkit-scrollbar-button': {
    width: `calc((100vw - ${slimBlockWidth}px)/4)`,
  },

  '&::-ms-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: defaultScrollbarWidth,
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-ms-scrollbar-button': {
    width: `calc((100vw - ${slimBlockWidth}px)/4)`,
  },
});

export const deciTabsScrollbarStyles = css({
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('backgroundHeavy'),
    },
  },
  '&::-webkit-scrollbar': {
    backgroundColor: 'transparent',
    width: defaultScrollbarWidth,
    height: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
    borderRadius: defaultScrollbarWidth,
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },

  '&::-ms-scrollbar-thumb': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: defaultScrollbarWidth,
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
  },
});

// use only inside the editor
// make different styles for outside
export const deciInsideNotebookOverflowXStyles = css(
  {
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  insideNotebookScrollbarStyles
);

export const deciTabsOverflowXStyles = css(
  {
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  deciTabsScrollbarStyles
);

export const deciOverflowYStyles = css(
  {
    overflowY: 'auto',
    msOverflowStyle: 'none',
  },
  noTrackScrollbarStyles
);

export const deciOverflowXStyles = css(
  {
    overflowX: 'auto',
    msOverflowStyle: 'none',
  },
  noTrackScrollbarStyles
);

export const deciOverflowStyles = css(
  {
    overflow: 'auto',
    msOverflowStyle: 'none',
  },
  noTrackScrollbarStyles
);
