import { css } from '@emotion/react';
import { p14Regular } from 'libs/ui/src/primitives';

export const plotTitleStyles = css({
  position: 'absolute',
  zIndex: 9,
  right: 18,
  top: 18,
  button: {
    float: 'right',
  },
});

export const plotBlockStyles = css({
  display: 'grid',
});

export const plotStyles = css({
  alignSelf: 'center',
});

export const cellInputStyles = [
  { cursor: 'text' },
  {
    input: css(p14Regular, {
      padding: '0',
      marginTop: 8,
      width: '100%',
      borderStyle: 'none',
      resize: 'none',

      color: 'inherit',
      overflowY: 'hidden',
      backgroundColor: 'inherit',
      textAlign: 'center',
      ':focus': { '::placeholder': { opacity: 0 } },
    }),
  },
  { input: { fontVariantNumeric: 'unset' } },
];

export const positionRelative = css({ position: 'relative' });
