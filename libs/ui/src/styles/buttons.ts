import { css } from '@emotion/react';
import {
  black,
  cssVar,
  hexToOpaqueColor,
  transparency,
  weakOpacity,
} from '../primitives';

export const mainIconButtonStyles = css({
  display: 'inline-block',
  borderRadius: '100vmax',

  ':hover, :focus': {
    backgroundColor: transparency(
      hexToOpaqueColor(cssVar('strongerHighlightColor')) || black,
      weakOpacity
    ).rgba,
  },
});

export const roundedSquareStyles = css({
  borderRadius: '6px',
});
