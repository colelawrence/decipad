import { cssVar } from '@decipad/ui';
import { css } from '@emotion/react';

export const textWidth = css`
  max-width: 220px;
`;

export const stickyWrapper = css({
  position: 'relative',
});

export const stickyLeftColumn = css({
  position: 'sticky',
  top: 0,
  verticalAlign: 'middle',
});

export const stickySecondLeftColumn = css({
  boxShadow: `-1px 0 0 ${cssVar('borderSubdued')}`,
});

const background = cssVar('backgroundMain');

export const rightAddColumnWrapper = css({
  position: 'absolute',
  top: 1,
  left: '100%',
  transition: 'left .4s',
  '::before': {
    content: '""',

    position: 'absolute',
    top: -4,
    left: -16,
    right: -16,
    bottom: 0,

    display: 'block',

    background: `linear-gradient(270deg, transparent 0%, ${background} 35%, ${background} 65%, transparent 100%)`,
  },
});

export const rightAddColumnWhenEmpty = css({
  left: -8,
});

export const addNumericRowButtonStyles = css({
  marginLeft: -8,
});
