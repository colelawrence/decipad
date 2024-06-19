import type { SVGProps } from 'react';

export const Reset = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Reset</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M7.42 13.3H4.863A1.46 1.46 0 0 1 3.4 11.838V4.162c0-.807.654-1.462 1.462-1.462h4.569l3.107 3.107v1.645"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.355 5.99H9.25V2.883"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.426 13.414a2.163 2.163 0 0 0 2.96 0 1.937 1.937 0 0 0 0-2.828 2.163 2.163 0 0 0-2.96 0 2 2 0 0 0-.426.586"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 9.5v1.556c0 .245.199.444.444.444H11.5"
      />
    </svg>
  );
};
