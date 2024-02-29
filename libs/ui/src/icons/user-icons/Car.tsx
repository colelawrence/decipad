import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Car = ({
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
        d="M18.25 17.25H5.75a1 1 0 0 1-1-1v-3.5a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v3.5a1 1 0 0 1-1 1"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M16.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.25 10.75H5.75l.721-4.329A2 2 0 0 1 8.444 4.75h7.112a2 2 0 0 1 1.973 1.671l.721 4.329M6.75 17.75v1.5M17.25 17.75v1.5"
      />
    </svg>
  );
};
