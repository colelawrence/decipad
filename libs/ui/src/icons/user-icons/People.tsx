import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const People = ({
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
        d="M11.25 7a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0M14.75 9.25c1.243 0 2.5-1.007 2.5-2.25s-1.257-2.25-2.5-2.25M9 9.75c-3.4 0-4.25 1.75-4.25 4.5h2v3a2 2 0 0 0 2 2h.5a2 2 0 0 0 2-2v-3h2c0-2.75-.85-4.5-4.25-4.5M14.75 9.25c3.4 0 4.5 2.25 4.5 5h-2v3a2 2 0 0 1-2 2h-.5"
      />
    </svg>
  );
};
