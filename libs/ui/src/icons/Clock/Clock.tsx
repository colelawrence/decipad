import { cssVar } from '../../primitives';

export const Clock = (): ReturnType<React.FC> => {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Clock</title>
      <circle
        cx="12"
        cy="12"
        r="7.25"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
      />
      <path
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        d="M12 8V12L14 14"
      />
    </svg>
  );
};
