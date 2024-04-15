import type { SVGProps } from 'react';

export const Category = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Category</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4.455v1.09C3 6.35 3.651 7 4.455 7h1.09C6.35 7 7 6.349 7 5.545v-1.09C7 3.65 6.349 3 5.545 3h-1.09C3.65 3 3 3.651 3 4.455M9 4.455v1.09C9 6.35 9.651 7 10.454 7h1.092C12.349 7 13 6.349 13 5.545v-1.09C13 3.65 12.349 3 11.546 3h-1.091C9.65 3 9 3.651 9 4.455M3 10.455v1.09C3 12.35 3.651 13 4.455 13h1.09C6.35 13 7 12.349 7 11.546v-1.091C7 9.65 6.349 9 5.545 9h-1.09C3.65 9 3 9.651 3 10.454M9 10.455v1.09C9 12.35 9.651 13 10.454 13h1.092c.803 0 1.454-.651 1.454-1.454v-1.091C13 9.65 12.349 9 11.546 9h-1.091C9.65 9 9 9.651 9 10.454"
      />
    </svg>
  );
};
