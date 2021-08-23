import { cssVar } from '../../primitives';

export const Delete = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Delete</title>
    <path
      d="M2.75 3.5H5V2H11V3.5H13.25V5H2.75V3.5Z"
      fill={cssVar('currentTextColor')}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.75 6.5H4.25V14H11.75V6.5Z"
      fill={cssVar('currentTextColor')}
    />
  </svg>
);
