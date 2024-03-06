import { cssVar } from '../../primitives';

export const Source = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Source</title>
    <path
      d="M10.5 5.83337L12.8333 8.00004L10.5 10.1667"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.49984 5.83337L3.1665 8.00004L5.49984 10.1667"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
