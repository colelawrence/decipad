import type { SVGProps } from 'react';

export const Dice = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Dice</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 4.75H6.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M9.5 9a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M15.5 15a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
    </svg>
  );
};
