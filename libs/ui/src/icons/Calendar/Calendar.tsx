import { cssVar } from '../../primitives';

export const Calendar = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Calendar</title>
    <path
      d="M1.073 3.57877C1.073 2.9033 1.62058 2.35571 2.29606 2.35571H8.71713C9.39263 2.35571 9.9402 2.9033 9.9402 3.57877V8.77679C9.9402 9.45228 9.39263 9.99985 8.71713 9.99985H2.29606C1.62058 9.99985 1.073 9.45228 1.073 8.77679V3.57877Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="0.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.05713 1.1333V3.27366"
      stroke={cssVar('currentTextColor')}
      strokeWidth="0.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.95361 1.1333V3.27366"
      stroke={cssVar('currentTextColor')}
      strokeWidth="0.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.9082 4.80225H8.10622"
      stroke={cssVar('currentTextColor')}
      strokeWidth="0.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
