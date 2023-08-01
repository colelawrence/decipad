import { cssVar } from '../../primitives';

export const Calendar = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Calendar</title>
    <path
      d="M2.00095 5.30963C2.00095 4.39545 2.74204 3.65436 3.65622 3.65436H12.3464C13.2606 3.65436 14.0017 4.39545 14.0017 5.30963V12.3445C14.0017 13.2587 13.2606 13.9998 12.3464 13.9998H3.65622C2.74204 13.9998 2.00095 13.2587 2.00095 12.3445V5.30963Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.68634 2V4.89672"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.3131 2V4.89672"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.48483 6.96539H11.5197"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
