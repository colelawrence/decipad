import { cssVar } from '../../primitives';

export const File = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>File</title>
    <path
      d="M3.33333 0H0V10H8V4.375H3.33333V0Z"
      fill={cssVar('iconColorHeavy')}
    />
    <path d="M4.66667 0V3.125H8L4.66667 0Z" fill={cssVar('iconColorHeavy')} />
  </svg>
);
