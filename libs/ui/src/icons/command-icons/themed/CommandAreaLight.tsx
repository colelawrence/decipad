import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandAreaLight = ({
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
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.75 11.75v16.5h16.5"
      />
      <path
        fill="#AAB1BD"
        d="M15.625 25.497H25.75c.622 0 1.125-.494 1.125-1.106v-3.235c0-.263-.095.36-.27.16l-2.314-2.653c-.291-.663-1.185-.518-1.649-.062l-.738.726a.854.854 0 0 1-1.245-.056l-1.378-1.623a1.14 1.14 0 0 0-1.712-.02l-2.791 3.136c-.18.2-.278.46-.278.729v2.902c0 .611.503 1.105 1.125 1.105v-.003"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeWidth={1.5}
        d="m15 21.3 2.45-3.61c.25-.37.667-.59 1.113-.59v0c.449 0 .872.21 1.144.566l1.057 1.385a.943.943 0 0 0 1.41.1l1.162-1.14a.735.735 0 0 1 .514-.211v0c.256 0 .494.133.627.352L26.4 21.3"
      />
    </svg>
  );
};
