import { SerializedStyles } from '@emotion/react';
import { FC } from 'react';
import { cssVar } from '../../primitives';

interface TableIconProps {
  css?: SerializedStyles;
  strokeColor?: string;
  noBackground?: boolean;
}

export const Table: FC<TableIconProps> = ({
  css,
  strokeColor,
  noBackground,
}) => {
  const currentStroke = strokeColor || cssVar('strongTextColor');
  return (
    <svg
      css={css}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Table</title>
      <g clipPath="url(#clip0_7715_3120)">
        <path
          d="M1.5 12.5V3.5C1.5 2.39543 2.39543 1.5 3.5 1.5H12.5C13.6046 1.5 14.5 2.39543 14.5 3.5V12.5C14.5 13.6046 13.6046 14.5 12.5 14.5H3.5C2.39543 14.5 1.5 13.6046 1.5 12.5Z"
          fill={noBackground ? 'transparent' : cssVar('iconBackgroundColor')}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.5 8V12.5C14.5 13.6046 13.6046 14.5 12.5 14.5H8V8H14.5Z"
          fill={cssVar('backgroundColor')}
        />
        <path d="M8 1.5V14.5" stroke={currentStroke} strokeWidth="1.2" />
        <path d="M1.5 8H14.5" stroke={currentStroke} strokeWidth="1.2" />
        <path
          d="M1.5 12.5V3.5C1.5 2.39543 2.39543 1.5 3.5 1.5H12.5C13.6046 1.5 14.5 2.39543 14.5 3.5V12.5C14.5 13.6046 13.6046 14.5 12.5 14.5H3.5C2.39543 14.5 1.5 13.6046 1.5 12.5Z"
          stroke={currentStroke}
          strokeWidth="1.2"
        />
      </g>
      <defs>
        <clipPath id="clip0_7715_3120">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
