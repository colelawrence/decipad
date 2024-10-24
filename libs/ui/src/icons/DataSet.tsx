import type { SVGProps } from 'react';
import { cssVar } from '../primitives';

export const DataSet = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>DataSet</title>
      <path
        fill={cssVar('iconColorMain')}
        d="m27.075 28.735 2.097-7.827c.22-.824-.31-1.681-1.184-1.916l-3.96-1.06-5.456 2.932-1.398 5.218c-.22.823.31 1.68 1.185 1.915l6.732 1.804c.875.234 1.764-.243 1.984-1.066Z"
      />
      <path
        stroke={cssVar('iconColorHeavy')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m24.027 17.931 3.96 1.061c.876.235 1.406 1.092 1.185 1.916l-2.097 7.827c-.22.823-1.109 1.3-1.984 1.066l-6.732-1.804c-.875-.234-1.406-1.092-1.185-1.915l1.398-5.218m5.455-2.933-.699 2.61c-.22.822-1.109 1.3-1.983 1.066l-2.773-.743m5.455-2.933-5.455 2.933"
      />
      <path
        stroke={cssVar('iconColorHeavy')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m20.05 25.799 4.83 1.294M23.581 24.21l1.932.518"
      />
      <path
        fill={cssVar('iconColorSubdued')}
        stroke={cssVar('iconColorHeavy')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M17.823 23.65c3.487-.367 6.43-1.72 6.325-2.717l-.948-9.018-13.075 1.375.947 9.017c.105.996 3.265 1.709 6.752 1.342Z"
      />
      <path
        stroke={cssVar('iconColorHeavy')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M23.675 16.424c.105.996-2.838 2.35-6.325 2.716-3.486.367-6.646-.346-6.75-1.342"
      />
      <path
        fill={cssVar('iconColorSubdued')}
        stroke={cssVar('iconColorHeavy')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M23.2 11.915c.105.996-2.838 2.35-6.324 2.716-3.487.367-6.647-.345-6.752-1.341-.104-.997 2.839-2.35 6.325-2.717 3.486-.366 6.647.346 6.751 1.342Z"
      />
    </svg>
  );
};
