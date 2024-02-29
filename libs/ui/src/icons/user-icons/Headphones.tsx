import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Headphones = ({
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
        d="M19.25 16v-3.75a7.25 7.25 0 1 0-14.5 0V16"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 15.45a2.7 2.7 0 0 1 2.7-2.7 1.8 1.8 0 0 1 1.8 1.8v2.9a1.8 1.8 0 0 1-1.8 1.8 2.7 2.7 0 0 1-2.7-2.7zM14.75 14.55a1.8 1.8 0 0 1 1.8-1.8 2.7 2.7 0 0 1 2.7 2.7v1.1a2.7 2.7 0 0 1-2.7 2.7 1.8 1.8 0 0 1-1.8-1.8z"
      />
    </svg>
  );
};
