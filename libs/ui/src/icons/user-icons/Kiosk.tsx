import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Kiosk = ({
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
        d="M6.75 19.25h10.5a2 2 0 0 0 2-2V8.183a2 2 0 0 0-.18-.827l-.537-1.184A2 2 0 0 0 16.713 5H7.287a2 2 0 0 0-1.82 1.172l-.539 1.184a2 2 0 0 0-.179.827v9.067a2 2 0 0 0 2 2"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.5 7.75c0 1.243-1 2.5-2.5 2.5s-2.25-1.257-2.25-2.5M19.25 7.75c0 1.243-.75 2.5-2.25 2.5s-2.5-1.257-2.5-2.5M14.5 7.75c0 1.243-1 2.5-2.5 2.5s-2.5-1.257-2.5-2.5M9.75 15.75a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v3.5h-4.5v-3.5"
      />
    </svg>
  );
};
