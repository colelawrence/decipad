import type { SVGProps } from 'react';

export const CreditCard = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CreditCard</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3 5.069c0-.762.617-1.38 1.379-1.38h7.242c.761 0 1.379.618 1.379 1.38v5.862a1.38 1.38 0 0 1-1.38 1.38H4.38a1.38 1.38 0 0 1-1.38-1.38V5.07"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.172 6.793h9.656M5.069 9.552h1.724M10.586 9.552h.345"
      />
    </svg>
  );
};
