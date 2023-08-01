import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar } from '../../primitives';

const spinnerWrapperStyles = css({
  height: '16px',
  width: '16px',
  lineHeight: '35px',
});

const spinnerStyles = css({
  animation: 'rotate 2s linear infinite',
});

const circleStyles = css({
  stroke: cssVar('textDefault'),
  strokeLinecap: 'round',
  animation: 'dash 1.5s ease-in-out infinite',
  '@keyframes rotate': {
    '100%': {
      transform: 'rotate(360deg)',
    },
  },

  '@keyframes dash': {
    '0%': {
      strokeDasharray: '1, 150',
      strokeDashoffset: 0,
    },
    '50%': {
      strokeDasharray: '90, 150',
      strokeDashoffset: -35,
    },
    '100%': {
      strokeDasharray: '90, 150',
      strokeDashoffset: -124,
    },
  },
});

export const Spinner: FC = () => (
  <div css={spinnerWrapperStyles}>
    <svg css={spinnerStyles} viewBox="0 0 25 25">
      <circle
        css={circleStyles}
        cx="12.5"
        cy="12.5"
        r="10"
        fill="none"
        strokeWidth="2.5"
      ></circle>
    </svg>
  </div>
);
