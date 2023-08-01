import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Toggle: FC = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <g clipPath="url(#clip0_507_34783)">
      <rect
        x="9"
        y="15"
        width="17"
        height="10"
        rx="5"
        fill={cssVar('iconColorDefault')}
      />
      <g filter="url(#filter0_dd_507_34783)">
        <rect
          x="19"
          y="15"
          width="10"
          height="10"
          rx="5"
          fill={cssVar('iconColorMain')}
        />
        <rect
          x="18.35"
          y="14.35"
          width="11.3"
          height="11.3"
          rx="5.65"
          stroke={cssVar('iconColorHeavy')}
          strokeWidth="1.3"
        />
      </g>
    </g>
    <defs>
      <filter
        id="filter0_dd_507_34783"
        x="6.7002"
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
          result="effect1_dropShadow_507_34783"
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
          in2="effect1_dropShadow_507_34783"
          result="effect2_dropShadow_507_34783"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_507_34783"
          result="shape"
        />
      </filter>
      <clipPath id="clip0_507_34783">
        <rect
          x="8"
          y="8"
          width="24"
          height="24"
          rx="6"
          fill={cssVar('iconColorMain')}
        />
      </clipPath>
    </defs>
  </svg>
);
