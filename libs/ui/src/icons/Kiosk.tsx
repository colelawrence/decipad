import { cssVar } from '../primitives';

export const Kiosk = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Kiosk</title>
    <path
      d="M5.75 10.225v5.025m0 0h-1m1 0h1m11.5 0v-5.025m0 5.025h1m-1 0h-1m-10.5 0v4h10.5v-4m-10.5 0h10.5M4.75 8 6 4.75h12L19.25 8v1c0 .69-.56 1.25-1.25 1.25S16.5 9.69 16.5 9c0 .69-.81 1.25-1.5 1.25S13.5 9.69 13.5 9c0 .69-.81 1.25-1.5 1.25S10.5 9.69 10.5 9c0 .69-.81 1.25-1.5 1.25S7.5 9.69 7.5 9c0 .69-.81 1.25-1.5 1.25S4.75 9.69 4.75 9V8Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
