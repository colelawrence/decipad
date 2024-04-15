import type { SVGProps } from 'react';

export const Shapes = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Shapes</title>
      <path
        stroke="currentColor"
        strokeWidth={1.3}
        d="M9.6 13v-2.4a1 1 0 0 1 1-1H13a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1h-2.4a1 1 0 0 1-1-1ZM2.4 14.036v-4.5a.2.2 0 0 1 .296-.175l3.806 2.077a.2.2 0 0 1 .012.344l-3.807 2.422a.2.2 0 0 1-.307-.168Z"
      />
      <circle
        cx={4.4}
        cy={4.4}
        r={2.15}
        stroke="currentColor"
        strokeWidth={1.3}
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m9.2 6.8 5.2-5.2m-5.2 0 5.2 5.2"
      />
    </svg>
  );
};
