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
        strokeOpacity={0.5}
        strokeWidth={1.2}
        rx={2.4}
      />
      <g strokeOpacity={0.5}>
        <path
          d="M10 6L5.99988 10.0001"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M6 6L10.0001 10.0001"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
