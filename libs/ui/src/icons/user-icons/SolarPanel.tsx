import type { SVGProps } from 'react';

export const SolarPanel = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>SolarPanel</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 12.75H6.75l-1 3m6.25-3h5.25l1 3m-6.25-3v3m-6.25 0-1 3.5H12m-6.25-3.5H12m6.25 0 1 3.5H12m6.25-3.5H12m0 0v3.5m-4.25-9h.75a.25.25 0 0 0 .25-.25 3.25 3.25 0 0 1 6.5 0c0 .138.112.25.25.25h.75M12 4.75V6.5m-3.25.25.752.752m5.748-.752-.75.75"
      />
    </svg>
  );
};
