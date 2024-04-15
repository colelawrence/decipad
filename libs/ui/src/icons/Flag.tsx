import type { SVGProps } from 'react';

export const Flag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Flag</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.167 3.834v9"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.167 10.167V3.832S4 3.166 6 3.166s3 1 4.666 1c1.667 0 2.167-.333 2.167-.333L10.5 7l2.333 3.166s-.5.667-2.167.667C9 10.833 7.666 9.5 6 9.5c-1.667 0-2.833.666-2.833.666"
      />
    </svg>
  );
};
