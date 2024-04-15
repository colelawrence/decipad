import type { SVGProps } from 'react';

export const StyleItalic = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>StyleItalic</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M12 3.428H6.857M9.143 12.572H4M9.714 3.428l-3.428 9.143"
      />
    </svg>
  );
};
