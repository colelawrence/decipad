import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Shirt = ({
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
        d="M16.25 12v6.25a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1V12m8.5 0v-1.25m0 1.25 3-1.25-4.25-6s-1.592 1.5-3 1.5-3-1.5-3-1.5l-4.25 6 3 1.25m0 0v-1.25"
      />
    </svg>
  );
};
