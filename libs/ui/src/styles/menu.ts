import { css } from '@emotion/react';
import { p14Regular, cssVar } from '../primitives';

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
});
