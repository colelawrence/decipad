import type { SVGProps } from 'react';

export const Play = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Play</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m5.598 4.118 5.793 2.899a1.1 1.1 0 0 1 0 1.97l-5.793 2.895A1.104 1.104 0 0 1 4 10.897V5.103c0-.82.864-1.352 1.598-.985"
      />
    </svg>
  );
};
