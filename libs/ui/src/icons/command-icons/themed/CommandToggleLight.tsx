import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandToggleLight = ({
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
      <g clipPath="url(#CommandToggleLight_svg__a)">
        <rect width={17} height={10} x={9} y={15} fill="#AAB1BD" rx={5} />
        <g filter="url(#CommandToggleLight_svg__b)">
          <rect width={10} height={10} x={19} y={15} fill="#fff" rx={5} />
          <rect
            width={11.3}
            height={11.3}
            x={18.35}
            y={14.35}
            stroke="#4D5664"
            strokeWidth={1.3}
            rx={5.65}
          />
        </g>
      </g>
      <defs>
        <clipPath id="CommandToggleLight_svg__a">
          <rect width={24} height={24} x={8} y={8} fill="#fff" rx={6} />
        </clipPath>
        <filter
          id="CommandToggleLight_svg__b"
          width={34.6}
          height={34.6}
          x={6.7}
          y={3.8}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.1} />
          <feGaussianBlur stdDeviation={2.2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.0456944 0 0 0 0 0.118665 0 0 0 0 0.233333 0 0 0 0.02 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_503_993"
          />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={1.1} />
          <feGaussianBlur stdDeviation={5.5} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.185417 0 0 0 0 0.254948 0 0 0 0 0.370833 0 0 0 0.04 0" />
          <feBlend
            in2="effect1_dropShadow_503_993"
            result="effect2_dropShadow_503_993"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect2_dropShadow_503_993"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
