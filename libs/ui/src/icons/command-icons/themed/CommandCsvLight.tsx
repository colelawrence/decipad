import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandCsvLight = ({
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
      <g clipPath="url(#CommandCSVLight_svg__a)">
        <path
          stroke="#4D5664"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.75 12.75h-5a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h4.5m.5-14.5v3.5a2 2 0 0 0 2 2h3.5z"
        />
        <path
          fill="#fff"
          stroke="#AAB1BD"
          strokeWidth={1.3}
          d="m23.217 22.266.571 7.065a.4.4 0 0 0 .74.177l1.427-2.332a.4.4 0 0 1 .328-.191l3.393-.109a.4.4 0 0 0 .217-.727l-6.047-4.243a.4.4 0 0 0-.629.36Z"
        />
      </g>
      <defs>
        <clipPath id="CommandCSVLight_svg__a">
          <path fill="#fff" d="M8 8h24v24H8z" />
        </clipPath>
      </defs>
    </svg>
  );
};
