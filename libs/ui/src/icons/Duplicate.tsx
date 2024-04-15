import type { SVGProps } from 'react';

export const Duplicate = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Duplicate</title>
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M9.601 6.5v-.9c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C8.081 2.4 7.521 2.4 6.401 2.4h-1.6c-1.121 0-1.681 0-2.109.218a2 2 0 0 0-.874.874C1.6 3.92 1.6 4.48 1.6 5.599V7.2c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h1.7"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeWidth={1.2}
        d="M11.201 6.4H9.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C6.4 7.92 6.4 8.48 6.4 9.599V11.2c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218H11.2c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874c.218-.428.218-.988.218-2.108V9.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.108-.218Z"
      />
    </svg>
  );
};
