import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandImageDark = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path fill="#1B1A28" d="M13 13h14l-.5 6-3.5-2-4 3h-2.5L13 22.5z" />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M25.25 12.75h-10.5a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2v-10.5a2 2 0 0 0-2-2"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m12.75 24 2.746-3.493a2 2 0 0 1 3.09-.068L21 23.25"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M18.915 20.823a624.713 624.713 0 0 0 2.576-3.31l.01-.013a2 2 0 0 1 3.085-.06L27 20.25"
      />
    </svg>
  );
};
