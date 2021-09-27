import { cssVar } from '../../primitives';

export const DataType = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Data type</title>
    <path
      d="M9.59998 13V10.6C9.59998 10.0477 10.0477 9.60001 10.6 9.60001H13C13.5523 9.60001 14 10.0477 14 10.6V13C14 13.5523 13.5523 14 13 14H10.6C10.0477 14 9.59998 13.5523 9.59998 13Z"
      fill="white"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.3"
    />
    <path
      d="M2.40002 14.0357V9.53692C2.40002 9.38511 2.56252 9.28865 2.6958 9.36134L6.50244 11.4377C6.63613 11.5106 6.64252 11.7002 6.51404 11.782L2.7074 14.2044C2.57425 14.2891 2.40002 14.1935 2.40002 14.0357Z"
      fill={cssVar('offColor')}
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.3"
    />
    <circle
      cx="4.39998"
      cy="4.40001"
      r="2.15"
      fill="white"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.3"
    />
    <path
      d="M9.19995 6.80001L14.4 1.60001M9.19995 1.60001L14.4 6.80001"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
