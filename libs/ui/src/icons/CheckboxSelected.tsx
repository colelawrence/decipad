import type { SVGProps } from 'react';

export const CheckboxSelected = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="presentation"
      data-title="CheckboxSelected"
      data-testid="checkbox-selected"
      {...props}
    >
      <rect
        width={11.8}
        height={11.8}
        x={2.1}
        y={2.1}
        stroke="currentColor"
        strokeWidth={1.2}
        rx={2.4}
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m5.6 8.001 2 2.4 3.2-4"
      />
    </svg>
  );
};
