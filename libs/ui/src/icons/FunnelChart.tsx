import type { SVGProps } from 'react';

export const FunnelChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>FunnelChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 2v12h12M4.5 12V4M7.3 12V6M10.1 12V8M12.9 12v-2"
      />
    </svg>
  );
};
