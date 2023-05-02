import { cssVar } from '../../primitives';

export const Users: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      stroke={cssVar('weakTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M10.35 11.5h1.95a.98.98 0 0 0 .989-1C13.22 8.333 12.767 7 9.8 7c-.524 0-1.1.2-1.3.3M10.049 7a2.25 2.25 0 1 0-2.17-2.848"
    />
    <path
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('normalTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M8.799 6a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0ZM6.549 8.75c-2.968 0-3.993 1.333-4.205 3.501-.054.55.403.999.955.999h6.5c.552 0 1.009-.45.955-.999-.213-2.168-1.237-3.501-4.205-3.501Z"
    />
  </svg>
);
