import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CPU = ({
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
        d="M6.75 8.75a2 2 0 0 1 2-2h6.5a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-6.5a2 2 0 0 1-2-2zM9.75 4.75v1.5M19.25 9.75h-1.5M9.75 17.75v1.5M6.25 9.75h-1.5M14.25 4.75v1.5M19.25 14.25h-1.5M14.25 17.75v1.5M6.25 14.25h-1.5"
      />
    </svg>
  );
};
