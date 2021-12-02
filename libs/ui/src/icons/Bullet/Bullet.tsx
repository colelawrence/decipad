import { cssVar } from '../../primitives';

export const Bullet = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Bullet</title>
    <circle cx="1.5" cy="1.5" r="1.5" fill={cssVar('currentTextColor')} />
  </svg>
);
