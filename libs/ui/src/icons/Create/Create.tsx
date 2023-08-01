import { cssVar } from '../../primitives';

export const Create = (): ReturnType<React.FC> => (
  <svg
    viewBox="0 0 20 20"
    fill={cssVar('iconColorDefault')}
    stroke={cssVar('textHeavy')}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Create</title>
    <path
      d="M10 5V15 M5 10H15"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
