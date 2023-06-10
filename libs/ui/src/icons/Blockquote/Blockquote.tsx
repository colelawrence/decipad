import { cssVar } from '../../primitives';

export const Blockquote = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Blockquote</title>
    <path
      d="M0 9.6C0 6.23969 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H30.4C33.7603 0 35.4405 0 36.7239 0.653961C37.8529 1.2292 38.7708 2.14708 39.346 3.27606C40 4.55953 40 6.23969 40 9.6V30.4C40 33.7603 40 35.4405 39.346 36.7239C38.7708 37.8529 37.8529 38.7708 36.7239 39.346C35.4405 40 33.7603 40 30.4 40H9.6C6.23969 40 4.55953 40 3.27606 39.346C2.14708 38.7708 1.2292 37.8529 0.653961 36.7239C0 35.4405 0 33.7603 0 30.4V9.6Z"
      fill={cssVar('slashColorLight')}
    />
    <path
      d="M19.25 19.25C19.25 20.3546 18.3546 21.25 17.25 21.25H14.75C13.6454 21.25 12.75 20.3546 12.75 19.25V17.0635C12.75 16.2262 13.0999 15.427 13.7152 14.8591L16 12.75V15.75H17.25C18.3546 15.75 19.25 16.6454 19.25 17.75V19.25Z"
      fill={cssVar('slashColorHeavy')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.25 25.25C27.25 26.3546 26.3546 27.25 25.25 27.25H22.75C21.6454 27.25 20.75 26.3546 20.75 25.25V23.0635C20.75 22.2262 21.0999 21.427 21.7152 20.8591L24 18.75V21.75H25.25C26.3546 21.75 27.25 22.6454 27.25 23.75V25.25Z"
      fill={cssVar('slashColorHeavy')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
