import type { SVGProps } from 'react';

export const Filter = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Filter</title>
      <path
        fill="currentColor"
        d="M3.167 4.2c-.277 0-.5.269-.5.6 0 .332.223.6.5.6zm9.666 1.2c.276 0 .5-.268.5-.6s-.224-.6-.5-.6zm-9.667 0h9.667V4.2H3.167zM4.5 7.4c-.276 0-.5.269-.5.6s.224.6.5.6zm7 1.2c.276 0 .5-.269.5-.6s-.224-.6-.5-.6zm-7 0h7V7.4h-7zM5.834 10.6c-.277 0-.5.269-.5.6 0 .332.223.6.5.6zm4.333 1.2c.276 0 .5-.269.5-.6s-.224-.6-.5-.6zm-4.333 0h4.333v-1.2H5.834z"
      />
    </svg>
  );
};
