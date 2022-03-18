import { cssVar } from '../../primitives';

export const Close = (): ReturnType<React.FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Close</title>
      <path
        d="M10.8284 5.17157L5.17151 10.8284"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M5.17163 5.17157L10.8285 10.8284"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
