import { cssVar } from '../../primitives';

export const Minus = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Minus</title>
    <path
      d="M4 8H12"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
