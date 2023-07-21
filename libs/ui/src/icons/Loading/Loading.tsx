/* eslint decipad/css-prop-named-variable: 0 */
import { keyframes } from '@emotion/react';
import { FC, SVGProps } from 'react';
import { cssVar } from '../../primitives';

// DO NOT change from CSS animations to SVG <animate> tags.
// They do not perform well. While the page is loading, the SVG animation is often stuck and not playing at all.
const dotKeyframes = keyframes`
  0% {
    opacity: 0;
  }
  33% {
    opacity: 1;
  }
  67% {
    opacity: 0;
  }
`;

// If you update this file, also update the manual copy of this icon in frontend/index.html

export const Loading = (
  props: Partial<SVGProps<SVGSVGElement>> = {}
): ReturnType<FC> => (
  <svg
    data-testid="loading"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    fill="none"
    y="0px"
    viewBox="0 0 16 16"
    {...props}
  >
    <title data-testid="loading-animation">Loading</title>
    <circle
      fill={cssVar('currentTextColor')}
      stroke="none"
      cx="4"
      cy="8"
      r="1"
      css={{ animation: `${dotKeyframes} linear 1s 0.1s infinite` }}
    />
    <circle
      fill={cssVar('currentTextColor')}
      stroke="none"
      cx="8"
      cy="8"
      r="1"
      css={{ animation: `${dotKeyframes} linear 1s 0.2s infinite` }}
    />
    <circle
      fill={cssVar('currentTextColor')}
      stroke="none"
      cx="12"
      cy="8"
      r="1"
      css={{ animation: `${dotKeyframes} linear 1s 0.3s infinite` }}
    />
  </svg>
);
