import type { SVGProps } from 'react';

export const Beach = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Beach</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 14.75c-6 0-7.25 4.5-7.25 4.5h14.5S18 14.75 12 14.75M12 16.25V10M12 4.75c-2.761 0-5.25 2.489-5.25 5.25 0 0 1-1.25 2.625-1.25S12 10 12 10s1-1.25 2.625-1.25S17.25 10 17.25 10c0-2.761-2.489-5.25-5.25-5.25"
      />
    </svg>
  );
};
