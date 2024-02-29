import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Construction = ({
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
        d="M19.25 5.75H4.75v4.5h3m11.5-4.5v4.5h-3m3-4.5-2.5 4.5m-.5 0v8m0-8H12.2m-4.45 0v8m0-8 2.5-4.5m-2.5 4.5h4.45m2.5-4.5-2.5 4.5"
      />
    </svg>
  );
};
