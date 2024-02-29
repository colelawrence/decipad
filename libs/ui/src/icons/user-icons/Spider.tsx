import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Spider = ({
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
        d="M7.75 13a4.25 4.25 0 0 1 8.5 0v2a4.25 4.25 0 0 1-8.5 0zM12 9v10M8.75 6.383c0-.902.731-1.633 1.633-1.633h3.234c.902 0 1.633.731 1.633 1.633 0 1.031-.836 1.867-1.867 1.867h-2.766A1.867 1.867 0 0 1 8.75 6.383M7.5 14.75l-1.433.521a2 2 0 0 0-1.317 1.88v2.099"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 11 5.802 9.816a2 2 0 0 1-1.052-1.76V5.75M16.5 14.75l1.433.521a2 2 0 0 1 1.317 1.88v2.099M16 11l2.198-1.184a2 2 0 0 0 1.052-1.76V5.75"
      />
    </svg>
  );
};
