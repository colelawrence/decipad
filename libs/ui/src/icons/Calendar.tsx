import type { SVGProps } from 'react';

export const Calendar = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Calendar</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3 5.44C3 4.645 3.618 4 4.38 4h7.24c.763 0 1.38.645 1.38 1.44v6.12c0 .795-.617 1.44-1.38 1.44H4.38C3.617 13 3 12.355 3 11.56zM5 3v2M11 3v2M5 7.5h6"
      />
    </svg>
  );
};
