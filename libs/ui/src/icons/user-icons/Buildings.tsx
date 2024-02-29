import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Buildings = ({
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
        d="M7.75 7.775h1.5m-1.5 3h1.5m5.5 3h1.5m-1.5-3h1.5m-4 8.475V5.75a1 1 0 0 0-1-1h-5.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1h6.5m0 0h6a1 1 0 0 0 1-1v-9.5a1 1 0 0 0-1-1h-5.5"
      />
    </svg>
  );
};
