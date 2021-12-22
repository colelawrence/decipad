import { cssVar } from '../../primitives';

export const Settings = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Settings</title>
    <path
      d="M3.16669 5.33331H4.83335"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 5.33331H12.8333"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.16669 10.6667H8.16669"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.8333 10.6667H12.8333"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.66669 6.83331C7.49511 6.83331 8.16669 6.16174 8.16669 5.33331C8.16669 4.50489 7.49511 3.83331 6.66669 3.83331C5.83826 3.83331 5.16669 4.50489 5.16669 5.33331C5.16669 6.16174 5.83826 6.83331 6.66669 6.83331Z"
      fill={cssVar('highlightColor')}
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.1667C10.8284 12.1667 11.5 11.4951 11.5 10.6667C11.5 9.83826 10.8284 9.16669 10 9.16669C9.17157 9.16669 8.5 9.83826 8.5 10.6667C8.5 11.4951 9.17157 12.1667 10 12.1667Z"
      fill={cssVar('highlightColor')}
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
