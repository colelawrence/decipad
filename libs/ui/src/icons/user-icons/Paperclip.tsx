import type { SVGProps } from 'react';

export const Paperclip = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Paperclip</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m19.25 11.951-6.117 5.91c-1.917 1.852-5.027 1.852-6.945 0a4.63 4.63 0 0 1 .018-6.728L11.85 5.7c1.313-1.268 3.44-1.268 4.752 0a3.17 3.17 0 0 1-.012 4.603l-5.708 5.482a1.86 1.86 0 0 1-2.565 0 1.71 1.71 0 0 1 0-2.479l4.727-4.566"
      />
    </svg>
  );
};
