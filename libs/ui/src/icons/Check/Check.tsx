import { SVGProps } from 'react';
import { offBlack, normalOpacity, transparency } from '../../primitives';

export const Check = (
  props: Partial<SVGProps<SVGSVGElement>> = {}
): ReturnType<React.FC> => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Check</title>
    <path
      d="M3.51624 6.82725C3.25515 6.54214 2.81236 6.52266 2.52725 6.78376C2.24214 7.04485 2.22266 7.48764 2.48376 7.77275L3.51624 6.82725ZM6.84615 11.5L6.32991 11.9728C6.46418 12.1194 6.65446 12.202 6.85326 12.2C7.05205 12.1979 7.24062 12.1115 7.37188 11.9622L6.84615 11.5ZM13.5257 4.96218C13.781 4.67183 13.7525 4.22953 13.4622 3.97427C13.1718 3.71902 12.7295 3.74747 12.4743 4.03782L13.5257 4.96218ZM2.48376 7.77275L6.32991 11.9728L7.3624 11.0272L3.51624 6.82725L2.48376 7.77275ZM7.37188 11.9622L13.5257 4.96218L12.4743 4.03782L6.32043 11.0378L7.37188 11.9622Z"
      stroke={transparency(offBlack, normalOpacity).rgba}
      strokeWidth="1.5"
    />
  </svg>
);
