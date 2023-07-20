import { cssVar } from '../../primitives';

export const Callout = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Callout</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />
    <rect
      x="11"
      y="12"
      width="18"
      height="1.3"
      rx="0.65"
      fill={cssVar('slashColorNormal')}
    />
    <rect
      x="11"
      y="15.8"
      width="18"
      height="5"
      rx="2"
      fill={cssVar('slashColorNormal')}
    />
    <rect
      x="11"
      y="15.8"
      width="18"
      height="5"
      rx="2"
      stroke={cssVar('slashColorHeavy')}
    />
    <rect
      x="11"
      y="23.3"
      width="18"
      height="1.3"
      rx="0.65"
      fill={cssVar('slashColorNormal')}
    />
    <rect
      x="11"
      y="27.1"
      width="18"
      height="1.3"
      rx="0.65"
      fill={cssVar('slashColorNormal')}
    />
  </svg>
);
