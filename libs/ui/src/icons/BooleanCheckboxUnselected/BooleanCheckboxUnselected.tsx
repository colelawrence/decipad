import { cssVar } from '../../primitives';

export const BooleanCheckboxUnselected = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Boolean checkbox unselected</title>
    <rect
      x="0.5"
      y="0.5"
      width="15"
      height="15"
      rx="3.5"
      stroke={cssVar('weakerTextColor')}
    />
    <path
      d="M4.5 7.75L7 10.25L11.5 5.75"
      stroke={cssVar('iconBackgroundColor')}
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </svg>
);
