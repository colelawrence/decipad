import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Spades = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.176 11.483c-.995 1.674-.188 3.71 1.801 4.547 1.258.53 1.432.354 2.273-.28l-1.5 3.5h6.5l-1.5-3.5c.84.634 1.015.81 2.273.28 1.99-.837 2.796-2.873 1.8-4.548C16.83 9.809 12 4.75 12 4.75s-4.83 5.058-5.824 6.733"
      />
    </svg>
  );
};
