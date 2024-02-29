import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Cup = ({
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
        d="M7.75 4.75h8.5V11a4.25 4.25 0 0 1-8.5 0zM16.5 6.75h.104a2.646 2.646 0 0 1 .904 5.134l-1.008.366M7.5 6.75h-.104a2.646 2.646 0 0 0-.904 5.134l1.008.366M12 15.5V19M8.75 19.25h6.5"
      />
    </svg>
  );
};
