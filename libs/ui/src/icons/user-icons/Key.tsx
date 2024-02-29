import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Key = ({
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
        d="M15 13.25a4.25 4.25 0 1 0-4.154-3.346L4.75 16v3.25H8l.75-.75v-1.75h1.75l1.25-1.25v-1.75h1.75l.596-.596c.291.063.594.096.904.096"
      />
      <path stroke="currentColor" d="M16.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
    </svg>
  );
};
