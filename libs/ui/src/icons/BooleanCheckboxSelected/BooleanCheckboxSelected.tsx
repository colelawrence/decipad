import { cssVar } from '../../primitives';

export const BooleanCheckboxSelected = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Boolean checkbox selected</title>
    <rect width="16" height="16" rx="4" fill={cssVar('iconColorDark')} />
    <path
      d="M4.5 7.75L7 10.25L11.5 5.75"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
