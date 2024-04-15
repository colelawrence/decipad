import type { SVGProps } from 'react';

export const CaretLeft = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CaretLeft</title>
      <path
        fill="currentColor"
        d="M6.928 7.308 8.15 6.33c.833-.666 1.249-.999 1.599-1a1 1 0 0 1 .782.377c.219.273.219.806.219 1.872v1.578c0 1.139 0 1.708-.23 1.985a1 1 0 0 1-.812.362c-.36-.015-.782-.396-1.628-1.157L6.87 9.259c-.385-.347-.578-.52-.644-.723a.8.8 0 0 1 .016-.544c.078-.198.28-.36.686-.684"
      />
    </svg>
  );
};
