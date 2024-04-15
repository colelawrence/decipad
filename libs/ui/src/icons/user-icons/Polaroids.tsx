import type { SVGProps } from 'react';

export const Polaroids = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Polaroids</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.75 9c.537.144.61.697.465 1.234L17 18.504a1.007 1.007 0 0 1-1.234.711L9.75 17.67m-5-4.92v1.5a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1v-1.5m-10.5 0v-7a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1v7m-10.5 0h10.5"
      />
    </svg>
  );
};
