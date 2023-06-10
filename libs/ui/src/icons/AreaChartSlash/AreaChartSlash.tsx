import { FC } from 'react';
import { cssVar } from '../../primitives';

export const AreaChartSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="6" fill={cssVar('slashColorLight')} />
    <path
      d="M11.75 11.75V28.25H28.25"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.625 25.4965H25.75C26.3723 25.4965 26.875 25.0025 26.875 24.3911V21.1555C26.875 20.8929 26.7801 21.5169 26.6043 21.3165L24.291 18.6634C24 18 23.1062 18.1452 22.6422 18.6013L21.9039 19.3267C21.5523 19.6722 20.9758 19.6445 20.6594 19.2714L19.2812 17.6478C18.8383 17.1262 18.0262 17.1158 17.5691 17.6271L14.7777 20.7638C14.5984 20.9642 14.5 21.2233 14.5 21.4927V24.3945C14.5 25.006 15.0027 25.5 15.625 25.5V25.4965Z"
      fill={cssVar('slashColorNormal')}
    />
    <path
      d="M15 21.3001L17.4499 17.6897C17.7002 17.3209 18.1169 17.1001 18.5625 17.1001V17.1001V17.1001C19.0115 17.1001 19.4349 17.3095 19.7073 17.6664L20.7643 19.051C21.1085 19.5018 21.7699 19.549 22.1745 19.1515L23.3357 18.0106C23.473 17.8757 23.6579 17.8001 23.8504 17.8001V17.8001C24.1064 17.8001 24.3439 17.9333 24.4773 18.1518L26.4 21.3001"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
