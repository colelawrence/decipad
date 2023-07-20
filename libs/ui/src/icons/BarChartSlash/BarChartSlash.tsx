import { FC } from 'react';
import { cssVar, normalOpacity } from '../../primitives';

export const BarChartSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />
    <path
      d="M14.225 15.875H13.4C12.4887 15.875 11.75 16.4496 11.75 17.1583V24.2167C11.75 24.9255 12.4887 25.5 13.4 25.5H14.225C15.1363 25.5 15.875 24.9255 15.875 24.2167V17.1583C15.875 16.4496 15.1363 15.875 14.225 15.875Z"
      fill={cssVar('slashColorNormal')}
      fillOpacity={normalOpacity}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.5492 11.75H19.7242C18.8129 11.75 18.0742 12.2853 18.0742 12.9457V24.3043C18.0742 24.9647 18.8129 25.5 19.7242 25.5H20.5492C21.4605 25.5 22.1992 24.9647 22.1992 24.3043V12.9457C22.1992 12.2853 21.4605 11.75 20.5492 11.75Z"
      fill={cssVar('slashColorNormal')}
      fillOpacity={normalOpacity}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.75 28.25H28.25"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.6 15.875H25.775C24.8637 15.875 24.125 16.4496 24.125 17.1583V24.2167C24.125 24.9255 24.8637 25.5 25.775 25.5H26.6C27.5113 25.5 28.25 24.9255 28.25 24.2167V17.1583C28.25 16.4496 27.5113 15.875 26.6 15.875Z"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
