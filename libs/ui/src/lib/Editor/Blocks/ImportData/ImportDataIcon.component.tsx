import { FC } from 'react';
import { css } from '@emotion/react';

const style = css({
  float: 'left',
  marginRight: '1em',
});

export const ELEMENT_IMPORT = 'ELEMENT_IMPORT';

export function ImportDataIconElement({
  contentType,
}: {
  contentType?: string;
}): ReturnType<FC> {
  let Icon: FC;
  if (!contentType) {
    return null;
  }
  switch (contentType) {
    case 'text/csv':
      Icon = SpreadsheetIcon;
      break;
    default:
      throw new Error(`unsupported content type: ${contentType}`);
  }
  return (
    <span css={style}>
      <Icon />
    </span>
  );
}

export const SpreadsheetIcon = (): ReturnType<FC> => {
  return (
    <svg
      fill="0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width="25"
      height="25"
    >
      <path d="M28.9 0L.8 5.3a1 1 0 00-.9 1v37.4c0 .4.3.9.8 1l28 5.3a1 1 0 001.2-1v-5h17c1 0 2-1 2-2V8c0-1-1-2-2-2H30V1a1 1 0 00-1.1-1zM28 2.2v4.3a1 1 0 000 1v40.3l-26-5V7.2zM30 8h17v34H30v-5h4v-2h-4v-6h4v-2h-4v-5h4v-2h-4v-5h4v-2h-4zm6 5v2h8v-2zM6.7 15.7l5.5 9.3-6 9.4h5l3.2-6L15 27l.4 1.3 3.2 6h5L17.7 25l5.6-9.2h-4.6l-3 5.5A21 21 0 0015 23l-.6-1.6-2.7-5.6zM36 20v2h8v-2zm0 7v2h8v-2zm0 8v2h8v-2z" />
    </svg>
  );
};
