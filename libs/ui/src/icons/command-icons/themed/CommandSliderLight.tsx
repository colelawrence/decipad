import type { SVGProps } from 'react';

export const CommandSliderLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandSliderLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <g clipPath="url(#CommandSliderLight_svg__a)">
        <rect width={24} height={2} x={8} y={19} fill="#4D5664" rx={1} />
        <rect width={9} height={2} x={23} y={19} fill="#AAB1BD" rx={1} />
        <g filter="url(#CommandSliderLight_svg__b)">
          <rect width={10} height={10} x={15} y={15} fill="#fff" rx={5} />
          <rect
            width={11.3}
            height={11.3}
            x={14.35}
            y={14.35}
            stroke="#4D5664"
            strokeWidth={1.3}
            rx={5.65}
          />
        </g>
      </g>
      <defs>
        <clipPath id="CommandSliderLight_svg__a">
          <path fill="#fff" d="M8 8h24v24H8z" />
        </clipPath>
        <filter
          id="CommandSliderLight_svg__b"
          width={34.6}
          height={34.6}
          x={2.7}
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
            result="effect1_dropShadow_503_987"
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
            in2="effect1_dropShadow_503_987"
            result="effect2_dropShadow_503_987"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect2_dropShadow_503_987"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
