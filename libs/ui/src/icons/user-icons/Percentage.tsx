import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Percentage = ({
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
        d="m17.25 6.75-10.5 10.5M16 17.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M8 9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"
      />
    </svg>
  );
};
