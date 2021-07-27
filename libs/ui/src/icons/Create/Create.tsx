import { cssVar } from '../../primitives';

export const Create = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Create</title>
    <path
      d="M5.5 4.5V1H4.5V4.5H1V5.5H4.5V9H5.5V5.5H9V4.5H5.5Z"
      fill={cssVar('weakTextColor')}
      stroke={cssVar('strongTextColor')}
      strokeWidth="0.1"
    />
  </svg>
);
