import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Truck = ({
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
        d="M15.25 15.25H4.75V4.75h10.5v10.5M9.25 17.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0M18.25 17.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0M19.25 15.25h-4v-6.5h1a3 3 0 0 1 3 3v3.5"
      />
    </svg>
  );
};
