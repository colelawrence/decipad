import { cssVar } from '../../primitives';

export const EmailSlash = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <rect
      x="10.65"
      y="13.15"
      width="18.7"
      height="13.7"
      rx="3.35"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M12 14L20 21L28 14"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
