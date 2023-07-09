import { css } from '@emotion/react';
import { cssVar } from '../primitives';

export const noTrackScrollbarStyles = css({
  '&:hover': {
    scrollbarWidth: 'inherit',
    msOverflowStyle: 'inherit',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: cssVar('scrollbarColor'),
    },
  },
  '&::-webkit-scrollbar': {
    backgroundColor: 'transparent',
    width: '8px',
    height: '8px',
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },

  '&::-ms-scrollbar-thumb': {
    backgroundColor: cssVar('scrollbarColor'),
    borderRadius: '8px',
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
      backgroundColor: cssVar('scrollbarColor'),
    },
  },
  '&::-webkit-scrollbar': {
    width: '100px',
    height: '8px',
  },

  '&::-webkit-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-webkit-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
  },

  '&::-ms-scrollbar-thumb': {
    width: '3px',
    height: '3px',
    backgroundColor: cssVar('scrollbarColor'),
    borderRadius: '8px',
  },

  '&::-ms-scrollbar-track': {
    backgroundColor: 'transparent',
    height: '3px',
  },

  '&::-ms-scrollbar-button': {
    width: `calc((100vw - 580px)/4)`,
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

export const deciOverflowYStyles = css(
  {
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  noTrackScrollbarStyles
);

export const deciOverflowStyles = css(
  {
    overflow: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  noTrackScrollbarStyles
);
