import { nanoid } from 'nanoid';
import { FC, useState } from 'react';
import { cssVar, strongOpacity } from '../../primitives';

export const Slider = (): ReturnType<FC> => {
  const [filterId] = useState(nanoid);

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Slider</title>
      <path
        d="M0 9.6C0 6.23969 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H30.4C33.7603 0 35.4405 0 36.7239 0.653961C37.8529 1.2292 38.7708 2.14708 39.346 3.27606C40 4.55953 40 6.23969 40 9.6V30.4C40 33.7603 40 35.4405 39.346 36.7239C38.7708 37.8529 37.8529 38.7708 36.7239 39.346C35.4405 40 33.7603 40 30.4 40H9.6C6.23969 40 4.55953 40 3.27606 39.346C2.14708 38.7708 1.2292 37.8529 0.653961 36.7239C0 35.4405 0 33.7603 0 30.4V9.6Z"
        fill={cssVar('slashColorLight')}
      />
      <rect
        x="6"
        y="19"
        width="28"
        height="2"
        rx="1"
        fill={cssVar('slashColorHeavy')}
      />
      <rect
        x="25"
        y="19"
        width="9"
        height="2"
        rx="1"
        fill={cssVar('slashColorNormal')}
      />
      <g filter={`url(#${filterId})`}>
        <rect
          x="15"
          y="14"
          width="12"
          height="12"
          rx="6"
          fill={cssVar('slashColorLight')}
        />
        <rect
          x="15"
          y="14"
          width="12"
          height="12"
          rx="6"
          fill={cssVar('backgroundColor')}
          fillOpacity={strongOpacity}
        />
        <rect
          x="14.35"
          y="13.35"
          width="13.3"
          height="13.3"
          rx="6.65"
          stroke={cssVar('slashColorHeavy')}
          strokeWidth="1.3"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="2.7002"
          y="2.79995"
          width="36.5996"
          height="36.6001"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.1" />
          <feGaussianBlur stdDeviation="2.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0456944 0 0 0 0 0.118665 0 0 0 0 0.233333 0 0 0 0.02 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_567_14029"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.1" />
          <feGaussianBlur stdDeviation="5.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.185417 0 0 0 0 0.254948 0 0 0 0 0.370833 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_567_14029"
            result="effect2_dropShadow_567_14029"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_567_14029"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
