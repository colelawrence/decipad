import { FC } from 'react';
import { teal100, teal200, teal500 } from '../../primitives';

export const Toggle: FC = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3618_49203)">
      <rect width="40" height="40" rx="6" fill={teal100.rgb} />
      <rect x="8" y="15" width="20" height="11" rx="5.5" fill={teal200.rgb} />
      <g filter="url(#filter0_dd_3618_49203)">
        <rect x="20" y="14" width="12" height="12" rx="6" fill="white" />
        <rect
          x="19.35"
          y="13.35"
          width="13.3"
          height="13.3"
          rx="6.65"
          stroke={teal500.rgb}
          strokeWidth="1.3"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_dd_3618_49203"
        x="7.7002"
        y="2.80001"
        width="36.5996"
        height="36.6"
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
          result="effect1_dropShadow_3618_49203"
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
          in2="effect1_dropShadow_3618_49203"
          result="effect2_dropShadow_3618_49203"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_3618_49203"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
