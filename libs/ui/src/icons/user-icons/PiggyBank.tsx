import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const PiggyBank = ({
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
        d="M4.75 14v-3a1 1 0 0 1 1-1h1s0-3.25 3.25-3.25v-2s2-.25 2 2h3.25a4 4 0 0 1 4 4v2.5a4 4 0 0 1-4 4H9C6.75 17.25 6.75 15 6.75 15h-1a1 1 0 0 1-1-1"
      />
      <path stroke="currentColor" d="M10.5 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.75 17.5v1.75M15.25 17.5v1.75"
      />
    </svg>
  );
};
