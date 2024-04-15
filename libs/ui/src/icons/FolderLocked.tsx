import type { SVGProps } from 'react';

export const FolderLocked = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>FolderLocked</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.833 12.834H4.499A1.333 1.333 0 0 1 3.166 11.5V5.167h8.333c.737 0 1.334.597 1.334 1.333v1"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m9 5-.622-1.138a1.333 1.333 0 0 0-1.17-.695H4.499c-.736 0-1.333.597-1.333 1.333v2.834"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.76 11.24c0-.202.164-.367.368-.367h3.862c.204 0 .368.165.368.368v2.023c0 .407-.33.736-.736.736H9.496a.736.736 0 0 1-.736-.736v-2.023"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.495 10.781v-.058c0-.574-.035-1.214.366-1.625.23-.235.6-.432 1.197-.432.598 0 .969.197 1.197.432.401.41.367 1.051.367 1.625v.058"
      />
    </svg>
  );
};
