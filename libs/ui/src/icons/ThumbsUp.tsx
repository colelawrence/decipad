import type { SVGProps } from 'react';

export const ThumbsUp = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ThumbsUp</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M9.097 6.5v-2c0-.398-.16-.78-.447-1.06A1.54 1.54 0 0 0 7.573 3L5.54 7.5V13h5.731c.245.003.483-.082.67-.238a1 1 0 0 0 .346-.612l.701-4.5a.98.98 0 0 0-.237-.806 1.01 1.01 0 0 0-.779-.344zM5.54 13H4.016c-.27 0-.528-.105-.718-.293A1 1 0 0 1 3 12V8.5c0-.265.107-.52.298-.707.19-.188.449-.293.718-.293H5.54"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M5.54 13H4.016c-.27 0-.528-.105-.718-.293A1 1 0 0 1 3 12V8.5c0-.265.107-.52.298-.707.19-.188.449-.293.718-.293H5.54m3.557-1v-2c0-.398-.16-.78-.447-1.06A1.54 1.54 0 0 0 7.573 3L5.54 7.5V13h5.731c.245.003.483-.082.67-.238a1 1 0 0 0 .346-.612l.701-4.5a.98.98 0 0 0-.237-.806 1.01 1.01 0 0 0-.779-.344z"
      />
    </svg>
  );
};
