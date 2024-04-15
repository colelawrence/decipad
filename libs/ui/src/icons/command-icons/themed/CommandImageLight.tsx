import type { SVGProps } from 'react';

export const CommandImageLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandImageLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path fill="#fff" d="M13 13h14l-.5 6-3.5-2-4 3h-2.5L13 22.5z" />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M25.25 12.75h-10.5a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2v-10.5a2 2 0 0 0-2-2"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m12.75 24 2.746-3.493a2 2 0 0 1 3.09-.068L21 23.25"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M18.915 20.823a626.296 626.296 0 0 0 2.576-3.31l.01-.013a2 2 0 0 1 3.085-.06L27 20.25"
      />
    </svg>
  );
};
