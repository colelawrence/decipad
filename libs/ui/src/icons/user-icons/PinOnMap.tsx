import type { SVGProps } from 'react';

export const PinOnMap = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>PinOnMap</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 9a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m5.75 13.75-.786 4.321a1 1 0 0 0 .984 1.179h12.104a1 1 0 0 0 .984-1.179l-.786-4.321m-2-4.8c0 3.05-4.25 6.3-4.25 6.3S7.75 12 7.75 8.95c0-2.32 1.903-4.2 4.25-4.2s4.25 1.88 4.25 4.2"
      />
    </svg>
  );
};
