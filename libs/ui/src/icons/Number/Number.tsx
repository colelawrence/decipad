import { cssVar } from '../../primitives';

export const Number = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Number</title>
    <path
      d="M2.8 6h10.4M2.8 10h10.4"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2.8v10.4M6 2.8v10.4"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
