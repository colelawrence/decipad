import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Happy = ({
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
        d="M8.75 4.75h6.5a4 4 0 0 1 4 4v6.5a4 4 0 0 1-4 4h-6.5a4 4 0 0 1-4-4v-6.5a4 4 0 0 1 4-4"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.75 12.75S9 15.25 12 15.25s4.25-2.5 4.25-2.5"
      />
      <path
        fill="currentColor"
        d="M14 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2M10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      />
    </svg>
  );
};
