import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Cloud = ({
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
        d="M4.75 14A3.25 3.25 0 0 0 8 17.25h8a3.25 3.25 0 0 0 .243-6.491 4.25 4.25 0 0 0-8.486 0A3.25 3.25 0 0 0 4.75 14"
      />
    </svg>
  );
};
