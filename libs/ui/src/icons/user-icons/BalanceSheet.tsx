import type { SVGProps } from 'react';

export const BalanceSheet = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>BalanceSheet</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12.75 4.75h-5a2 2 0 0 0-2 2v3.5m7-5.5v3.5a2 2 0 0 0 2 2h3.5m-5.5-5.5 5.5 5.5m0 0v7a2 2 0 0 1-2 2h-3.5M9.25 12.75h-.5a3 3 0 0 0-3 3v.5a3 3 0 0 0 3 3h.5M4.75 16h3.5"
      />
    </svg>
  );
};
