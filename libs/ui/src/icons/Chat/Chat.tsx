import { cssVar } from '../../primitives';

export const Chat = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Chat</title>
    <path
      d="M16 13C16 13.3536 15.8595 13.6928 15.6095 13.9428C15.3594 14.1929 15.0203 14.3333 14.6667 14.3333H6.66667L4 17V6.33333C4 5.97971 4.14048 5.64057 4.39052 5.39052C4.64057 5.14048 4.97971 5 5.33333 5H14.6667C15.0203 5 15.3594 5.14048 15.6095 5.39052C15.8595 5.64057 16 5.97971 16 6.33333V13Z"
      fill={cssVar('highlightColor')}
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
