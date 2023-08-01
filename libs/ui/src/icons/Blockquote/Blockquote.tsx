import { cssVar, normalOpacity } from '../../primitives';

export const Blockquote = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Blockquote</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <path
      d="M19.25 19.25C19.25 20.3546 18.3546 21.25 17.25 21.25H14.75C13.6454 21.25 12.75 20.3546 12.75 19.25V17.0635C12.75 16.2262 13.0999 15.427 13.7152 14.8591L16 12.75V15.75H17.25C18.3546 15.75 19.25 16.6454 19.25 17.75V19.25Z"
      fill={cssVar('iconColorMain')}
      fillOpacity={normalOpacity}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.25 25.25C27.25 26.3546 26.3546 27.25 25.25 27.25H22.75C21.6454 27.25 20.75 26.3546 20.75 25.25V23.0635C20.75 22.2262 21.0999 21.427 21.7152 20.8591L24 18.75V21.75H25.25C26.3546 21.75 27.25 22.6454 27.25 23.75V25.25Z"
      fill={cssVar('iconColorDefault')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
