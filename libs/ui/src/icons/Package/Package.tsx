import { cssVar } from '../../primitives';

export const Package = (): ReturnType<React.FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <title>Package</title>
    <path
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M5.75 8.87 12 12.25M5.75 8.87v7L12 19.25M5.75 8.87l3.125-1.56m9.375 1.56L12 5.75 8.875 7.31m9.375 1.56v7L12 19.25m6.25-10.38-3.125 1.69M12 12.25v7m0-7 3.125-1.69m0 0-6.25-3.25"
    />
  </svg>
);
