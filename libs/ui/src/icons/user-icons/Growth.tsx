import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Growth = ({
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
        d="m4.75 11.25 5.5-5.5M5.75 19.25h.5a1 1 0 0 0 1-1v-2.5a1 1 0 0 0-1-1h-.5a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1M11.75 19.25h.5a1 1 0 0 0 1-1v-5.5a1 1 0 0 0-1-1h-.5a1 1 0 0 0-1 1v5.5a1 1 0 0 0 1 1M17.75 19.25h.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1h-.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1M11.25 8.25v-3.5h-3.5"
      />
    </svg>
  );
};
