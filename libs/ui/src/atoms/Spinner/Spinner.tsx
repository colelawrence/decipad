import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar } from '../../primitives';

const spinnerWrapperStyles = css({
  width: '100%',
  display: 'inline',
});

const spinnerStyles = css({
  animation: 'rotate 2s linear infinite',
  zIndex: 2,
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-25px 0 0 -25px',
  width: '25px',
  height: '25px',
});

const circleStyles = css({
  stroke: cssVar('normalTextColor'),
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
  <span css={spinnerWrapperStyles}>
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
  </span>
);
