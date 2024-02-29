import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Newspaper = ({
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
        d="M17.25 19.25H5.75a1 1 0 0 1-1-1V5.75a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1V10"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.523 9.75H15.25v7.5a2 2 0 1 0 4 0v-5.773c0-.954-.773-1.727-1.727-1.727M7.75 8.75a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1zM8 13.75h4M8 16.25h4"
      />
    </svg>
  );
};
