import { css } from '@emotion/react';
import { cssVar, p14Regular, p8Medium } from '../primitives';

export const itemPadding = '6px';

export const itemStyles = css(p14Regular, {
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',

  padding: '6px',
  borderRadius: '6px',

  backgroundColor: cssVar('backgroundColor'),
  '&:hover, &:focus, &[data-selected="true"]': {
    backgroundColor: cssVar('highlightColor'),
  },

  outline: 'none',
});

export const itemDisabledStyles = css(itemStyles, {
  cursor: 'default',

  backgroundColor: cssVar('backgroundColor'),
  '&:hover, &:focus, &[data-selected="true"]': {
    backgroundColor: cssVar('backgroundColor'),
  },
});

export const soonStyles = css(p8Medium, {
  padding: '2px 4px',
  borderRadius: '4px',
  backgroundColor: cssVar('strongHighlightColor'),
  height: '12px',
});
