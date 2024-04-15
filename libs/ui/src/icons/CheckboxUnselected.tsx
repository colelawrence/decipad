import type { SVGProps } from 'react';

export const CheckboxUnselected = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CheckboxUnselected</title>
      <rect
        width={11.8}
        height={11.8}
        x={2.1}
        y={2.1}
        stroke="currentColor"
        strokeOpacity={0.6}
        strokeWidth={1.2}
        rx={2.4}
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.2}
        strokeWidth={1.2}
        d="m5.6 8.002 2 2.4 3.2-4"
      />
    </svg>
  );
};
