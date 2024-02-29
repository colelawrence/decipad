import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Plane = ({
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
        d="M10 8.407a4 4 0 0 1 1.172-2.829L12 4.75l.828.828A4 4 0 0 1 14 8.407v1.823l5.25 2.52v1.327a1 1 0 0 1-1.158.988L14 14.41v3.146l1.25.694v1h-6.5v-1l1.25-.625V14.41l-4.092.655a1 1 0 0 1-1.158-.988V12.75L10 10.23V8.407"
      />
    </svg>
  );
};
