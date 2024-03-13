import { cssVar } from '../../primitives';

export const Email = (): ReturnType<React.FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
    <path
      d="M3.16663 5.16665C3.16663 4.43027 3.76358 3.83331 4.49996 3.83331H11.5C12.2364 3.83331 12.8333 4.43027 12.8333 5.16665V10.8333C12.8333 11.5697 12.2364 12.1666 11.5 12.1666H4.49996C3.76358 12.1666 3.16663 11.5697 3.16663 10.8333V5.16665Z"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.66663 4.33331L7.99996 8.16665L12.3333 4.33331"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
