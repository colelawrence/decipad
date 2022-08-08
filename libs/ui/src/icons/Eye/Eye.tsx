import { cssVar } from '../../primitives';

export const Eye = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Eye</title>
    <g
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.03447"
    >
      <path d="m11.2257 5.06031c0 .68965-1.2068 4.31031-4.99991 4.31031-3.79307 0-4.99996-3.62066-4.99996-4.31031s1.20689-4.31031 4.99996-4.31031c3.79311 0 4.99991 3.62066 4.99991 4.31031z" />
      <path d="m6.22578 6.61221c.85699 0 1.55172-.69472 1.55172-1.55171s-.69473-1.55171-1.55172-1.55171c-.85698 0-1.55171.69472-1.55171 1.55171s.69473 1.55171 1.55171 1.55171z" />
    </g>
  </svg>
);
