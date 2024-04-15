import type { SVGProps } from 'react';

export const Descending = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Descending</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M6.733 9.722 4.455 12 2.177 9.723M4.456 6.533V12M12.2 7.444H8.1M12.2 11.089H9.011M12.2 3.8H4.455"
      />
    </svg>
  );
};
