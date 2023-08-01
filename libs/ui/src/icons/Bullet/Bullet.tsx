import { cssVar } from '../../primitives';

const shapes = [
  <circle cx="3" cy="3.5" r="3" fill={cssVar('iconColorHeavy')} />,
  <circle cx="3" cy="3.5" r="2.5" stroke={cssVar('iconColorHeavy')} />,
  <rect y="0.5" width="6" height="6" fill={cssVar('iconColorHeavy')} />,
];

interface BulletProps {
  /**
   * The number of <ul> ancestors this bullet has
   */
  readonly depth?: number;
}
export const Bullet = ({ depth = 1 }: BulletProps): ReturnType<React.FC> => (
  <svg viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Bullet</title>
    {shapes[(depth - 1) % shapes.length]}
  </svg>
);
