import { cssVar } from '../primitives';

export const Lock = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Lock</title>
    <path
      d="M5.16639 6.99996V6.89509C5.16639 5.85427 5.10377 4.69413 5.8307 3.94923C6.24525 3.52443 6.91606 3.16663 7.99973 3.16663C9.08339 3.16663 9.75419 3.52443 10.1687 3.94923C10.8957 4.69413 10.8331 5.85427 10.8331 6.89509V6.99996"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.83301 7.83341C3.83301 7.46521 4.13149 7.16675 4.49967 7.16675H11.4997C11.8679 7.16675 12.1663 7.46521 12.1663 7.83341V11.5001C12.1663 12.2365 11.5694 12.8334 10.833 12.8334H5.16634C4.42996 12.8334 3.83301 12.2365 3.83301 11.5001V7.83341Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
