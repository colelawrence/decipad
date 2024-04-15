import type { SVGProps } from 'react';

export const CaretDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CaretDown</title>
      <path
        fill="currentColor"
        d="M7.058 9.822 6.08 8.6C5.414 7.767 5.08 7.35 5.08 7a1 1 0 0 1 .377-.783C5.73 6 6.263 6 7.329 6h1.578c1.139 0 1.708 0 1.985.23a1 1 0 0 1 .362.812c-.015.36-.396.782-1.157 1.628L9.009 9.88c-.347.385-.52.578-.723.644a.8.8 0 0 1-.544-.016c-.198-.078-.36-.28-.684-.686"
      />
    </svg>
  );
};
