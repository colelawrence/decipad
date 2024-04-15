import type { SVGProps } from 'react';

export const ThumbnailGoogleSheetLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>ThumbnailGoogleSheetLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <g clipPath="url(#ThumbnailGoogleSheetLight_svg__a)">
        <path
          fill="#188038"
          d="m22.545 10 5 5-2.5.454-2.5-.454-.454-2.5.454-2.5"
        />
        <path
          fill="#34A853"
          d="M22.546 15v-5h-8.182C13.61 10 13 10.61 13 11.364v17.272c0 .754.61 1.364 1.364 1.364h11.818c.753 0 1.364-.61 1.364-1.364V15h-5"
        />
        <path
          fill="#fff"
          d="M15.727 17.727v6.591h9.091v-6.59h-9.09m3.977 5.455h-2.84V21.59h2.84v1.59m0-2.727h-2.84v-1.591h2.84v1.59m3.978 2.727H20.84V21.59h2.84v1.59m0-2.727H20.84v-1.591h2.84v1.59"
        />
      </g>
      <defs>
        <clipPath id="ThumbnailGoogleSheetLight_svg__a">
          <path fill="#fff" d="M13 10h14.546v20H13z" />
        </clipPath>
      </defs>
    </svg>
  );
};
