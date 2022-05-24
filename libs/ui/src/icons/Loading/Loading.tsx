import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Loading = (): ReturnType<FC> => (
  <svg
    version="1.1"
    id="L4"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    fill="none"
    y="0px"
    viewBox="0 0 16 16"
    enableBackground="new 0 0 0 0"
    xmlSpace="preserve"
  >
    <title>Loading</title>
    <circle fill={cssVar('normalTextColor')} stroke="none" cx="4" cy="8" r="1">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.1"
      />
    </circle>
    <circle fill={cssVar('normalTextColor')} stroke="none" cx="8" cy="8" r="1">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.2"
      />
    </circle>
    <circle fill={cssVar('normalTextColor')} stroke="none" cx="12" cy="8" r="1">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.3"
      />
    </circle>
  </svg>
);
