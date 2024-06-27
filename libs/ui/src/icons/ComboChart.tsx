import type { SVGProps } from 'react';

export const ComboChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ComboChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 2v12h12"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m13.29 3-3.179 3.18-2.444-1.641L4.5 7M4.5 12v-1M7.3 12V9M10.1 12v-1M12.9 12V9"
      />
    </svg>
  );
};
