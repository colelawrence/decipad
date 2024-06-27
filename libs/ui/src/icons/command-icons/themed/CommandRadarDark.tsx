import type { SVGProps } from 'react';

export const CommandRadarDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandRadarDark</title>
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path
        fill="#9B9AAC"
        fillRule="evenodd"
        d="m21.105 10.508 5.808 2.862a2.5 2.5 0 0 1 1.335 1.698l1.442 6.468a2.5 2.5 0 0 1-.468 2.08L25.19 28.79a2.5 2.5 0 0 1-1.972.964h-6.436a2.5 2.5 0 0 1-1.972-.964l-4.032-5.173a2.5 2.5 0 0 1-.468-2.081l1.442-6.468a2.5 2.5 0 0 1 1.335-1.698l5.808-2.862a2.5 2.5 0 0 1 2.21 0m-.663 1.345a1 1 0 0 0-.884 0l-5.807 2.862a1 1 0 0 0-.534.68l-1.443 6.467a1 1 0 0 0 .187.833l4.032 5.173a1 1 0 0 0 .789.386h6.436a1 1 0 0 0 .79-.386l4.031-5.173a1 1 0 0 0 .187-.833l-1.442-6.468a1 1 0 0 0-.534-.679z"
        clipRule="evenodd"
      />
      <path
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m20.798 15 1.123 4.286L25 20l-2.802 5-3.924-1.139L16 20.954v-4.525z"
      />
    </svg>
  );
};
