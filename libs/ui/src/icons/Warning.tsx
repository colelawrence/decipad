import type { SVGProps } from 'react';

export const Warning = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="presentation"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m2.165 11.604 4.357-8.69c.611-1.219 2.35-1.218 2.96 0l4.354 8.69a1.656 1.656 0 0 1-1.48 2.398h-8.71a1.656 1.656 0 0 1-1.48-2.398"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 5.516c.457 0 .828.37.828.828V8a.828.828 0 1 1-1.656 0V6.344c0-.457.37-.828.828-.828M8.828 11.311a.828.828 0 1 1-1.656 0 .828.828 0 0 1 1.656 0"
        clipRule="evenodd"
      />
    </svg>
  );
};
