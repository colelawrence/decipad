import type { SVGProps } from 'react';

export const BarChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>BarChart</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.8 5h-.6c-.663 0-1.2.418-1.2.933v5.134c0 .515.537.933 1.2.933h.6c.663 0 1.2-.418 1.2-.933V5.933C5 5.418 4.463 5 3.8 5M8.4 2h-.6c-.663 0-1.2.39-1.2.87v8.26c0 .48.537.87 1.2.87h.6c.662 0 1.2-.39 1.2-.87V2.87c0-.48-.538-.87-1.2-.87"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 14h12M12.8 5h-.6c-.663 0-1.2.418-1.2.933v5.134c0 .515.537.933 1.2.933h.6c.663 0 1.2-.418 1.2-.933V5.933C14 5.418 13.463 5 12.8 5"
      />
    </svg>
  );
};
