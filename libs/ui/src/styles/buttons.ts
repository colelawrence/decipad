import { css } from '@emotion/react';
import { cssVar } from '../primitives';

export const mainIconButtonStyles = css({
  display: 'inline-block',
  borderRadius: '100vmax',
  backgroundColor: cssVar('strongHighlightColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongerHighlightColor'),
  },
});

export const roundedSquareStyles = css({
  borderRadius: '6px',
});
