import { cssVar } from '../../primitives';

export const Callout = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Callout</title>
    <path
      d="M0 9.6C0 6.23969 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H30.4C33.7603 0 35.4405 0 36.7239 0.653961C37.8529 1.2292 38.7708 2.14708 39.346 3.27606C40 4.55953 40 6.23969 40 9.6V30.4C40 33.7603 40 35.4405 39.346 36.7239C38.7708 37.8529 37.8529 38.7708 36.7239 39.346C35.4405 40 33.7603 40 30.4 40H9.6C6.23969 40 4.55953 40 3.27606 39.346C2.14708 38.7708 1.2292 37.8529 0.653961 36.7239C0 35.4405 0 33.7603 0 30.4V9.6Z"
      fill={cssVar('slashColorLight')}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 12H8V11H32V12Z"
      fill={cssVar('slashColorNormal')}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 18C32 18.5523 31.5523 19 31 19H9C8.44772 19 8 18.5523 8 18V17C8 16.4477 8.44772 16 9 16H31C31.5523 16 32 16.4477 32 17V18Z"
      fill={cssVar('slashColorHeavy')}
    />
    <rect x="10" y="17" width="1" height="1" fill={cssVar('slashColorLight')} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 24H8V23H32V24Z"
      fill={cssVar('slashColorNormal')}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 29H8V28H32V29Z"
      fill={cssVar('slashColorNormal')}
    />
  </svg>
);
