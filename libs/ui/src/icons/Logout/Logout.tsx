import { cssVar } from '../../primitives';

export const Logout = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Logout</title>
    <path
      d="M6 8L12.5 8"
      stroke={cssVar('stateDangerBackground')}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M14.0757 8.42426L11.5243 10.9757C11.1463 11.3537 10.5 11.086 10.5 10.5515L10.5 5.44853C10.5 4.91399 11.1463 4.64628 11.5243 5.02426L14.0757 7.57574C14.3101 7.81005 14.3101 8.18995 14.0757 8.42426Z"
      fill={cssVar('stateDangerBackground')}
    />
    <path
      d="M6 3H4C2.89543 3 2 3.89543 2 5V11C2 12.1046 2.89543 13 4 13H6"
      stroke={cssVar('stateDangerBackground')}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
