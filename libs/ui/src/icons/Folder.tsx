import type { SVGProps } from 'react';

export const Folder = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Folder</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.833 11.5v-5c0-.736-.597-1.333-1.333-1.333H3.167V11.5c0 .736.596 1.333 1.333 1.333h7c.736 0 1.333-.597 1.333-1.333"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m9 5-.621-1.138a1.333 1.333 0 0 0-1.17-.695h-2.71c-.736 0-1.332.597-1.332 1.333v2.833"
      />
    </svg>
  );
};
