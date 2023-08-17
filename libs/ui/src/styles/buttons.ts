import { css } from '@emotion/react';
import { cssVar } from '../primitives';

export const mainIconButtonStyles = css({
  display: 'inline-block',
  borderRadius: '100vmax',

  ':hover, :focus': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});

export const roundedSquareStyles = css({
  borderRadius: '6px',
});

export const closeButtonStyles = css({
  width: '16px',
  height: '16px',
  display: 'grid',
  borderRadius: 4,
  ':hover': {
    backgroundColor: cssVar('backgroundHeavy'),
  },
});
