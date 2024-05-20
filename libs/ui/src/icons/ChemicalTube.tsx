import type { SVGProps } from 'react';

export const ChemicalTube = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ChemicalTube</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M10.931 3H5.069l.682.768c.45.505.697 1.157.697 1.833v1.882L3 13h10L9.552 7.483V5.6c0-.676.248-1.328.697-1.833z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        d="M3.5 13 5 10h6l1.5 3z"
      />
    </svg>
  );
};
