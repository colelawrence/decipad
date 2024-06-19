import type { SVGProps } from 'react';

export const ListNumbered = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ListNumbered</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M7.418 10.902h5.116M7.642 5.137h4.838"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.887}
        d="M2.9 4.66 3.98 3.4v3.24"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.945}
        d="M3.195 10.01c0-.203.167-.813.837-.813s.837.406.837.813-.376.974-.837 1.421a10 10 0 0 0-1.047 1.219h2.302"
      />
    </svg>
  );
};
