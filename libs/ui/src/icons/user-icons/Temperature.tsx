import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Temperature = ({
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
        d="M10.75 4.75a2 2 0 0 0-2 2v4.644a4.25 4.25 0 1 0 4.5 0V6.75a2 2 0 0 0-2-2zM17.25 4.75h-.5M17.25 7.75h-.5M17.25 10.75h-.5M11 15.25V13"
      />
    </svg>
  );
};
