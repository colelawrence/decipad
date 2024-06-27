import type { SVGProps } from 'react';

export const CohortChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CohortChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 2v12h12"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5 3.5h2v2H5zm2 3H5v2h2zm1 5v-2h2a1 1 0 0 0 1-1v-2h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1m2-8H8v2h2zm1 2h2v-2h-2zm-6 6v-2h2v2zm5-5H8v2h2z"
        clipRule="evenodd"
      />
    </svg>
  );
};
