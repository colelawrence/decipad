import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Slider = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Slider</title>

      <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />
      <g clipPath="url(#clip0_507_34780)">
        <rect
          x="8"
          y="19"
          width="24"
          height="2"
          rx="1"
          fill={cssVar('slashColorHeavy')}
        />
        <rect
          x="23"
          y="19"
          width="9"
          height="2"
          rx="1"
          fill={cssVar('slashColorNormal')}
        />
        <g filter="url(#filter0_dd_507_34780)">
          <rect
            x="15"
            y="15"
            width="10"
            height="10"
            rx="5"
            fill={cssVar('backgroundColor')}
          />
          <rect
            x="14.35"
            y="14.35"
            width="11.3"
            height="11.3"
            rx="5.65"
            stroke={cssVar('slashColorHeavy')}
            strokeWidth="1.3"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_dd_507_34780"
          x="2.7002"
          y="3.80001"
          width="34.5996"
          height="34.6"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
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
            result="effect1_dropShadow_507_34780"
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
            in2="effect1_dropShadow_507_34780"
            result="effect2_dropShadow_507_34780"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_507_34780"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_507_34780">
          <rect
            width="24"
            height="24"
            fill={cssVar('backgroundColor')}
            transform="translate(8 8)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
