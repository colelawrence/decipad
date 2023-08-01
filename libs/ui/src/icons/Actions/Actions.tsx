import { cssVar } from '../../primitives';

export const Actions = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Actions</title>
    <path
      d="M1.40039 10.2408V0.960781C1.40039 0.872416 1.47202 0.800781 1.56039 0.800781H12.4404C12.5288 0.800781 12.6004 0.872416 12.6004 0.960781V10.2408C12.6004 10.3291 12.5288 10.4008 12.4404 10.4008H1.56039C1.47203 10.4008 1.40039 10.3291 1.40039 10.2408Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.04"
      strokeLinejoin="round"
    />
    <path
      d="M9.40039 10.2408V0.960781C9.40039 0.872416 9.47203 0.800781 9.56039 0.800781H12.4404C12.5288 0.800781 12.6004 0.872416 12.6004 0.960781V10.2408C12.6004 10.3291 12.5288 10.4008 12.4404 10.4008H9.56039C9.47203 10.4008 9.40039 10.3291 9.40039 10.2408Z"
      fill={cssVar('iconColorHeavy')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="0.96"
      strokeLinejoin="round"
    />
    <line
      x1="10.3208"
      y1="2.28078"
      x2="11.6808"
      y2="2.28078"
      stroke={cssVar('iconColorMain')}
      strokeWidth="1.04"
      strokeLinecap="round"
    />
    <line
      x1="10.3208"
      y1="4.67922"
      x2="11.6808"
      y2="4.67922"
      stroke={cssVar('iconColorMain')}
      strokeWidth="1.04"
      strokeLinecap="round"
    />
  </svg>
);
