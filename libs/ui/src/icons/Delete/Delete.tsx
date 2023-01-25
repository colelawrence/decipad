import { cssVar } from '../../primitives';

interface DeleteProps {
  color?: 'normal' | 'weak';
}

export const Delete = ({
  color = 'normal',
}: DeleteProps): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Delete</title>
    <path
      d="M3.50031 4.35883L4.22121 12.6493C4.29824 13.5351 5.03976 14.2149 5.92887 14.2149H10.0708C10.9599 14.2149 11.7014 13.5351 11.7784 12.6493L12.4993 4.35883"
      fill={cssVar('highlightColor')}
    />
    <path
      d="M3.50031 4.35883L4.22121 12.6493C4.29824 13.5351 5.03976 14.2149 5.92887 14.2149H10.0708C10.9599 14.2149 11.7014 13.5351 11.7784 12.6493L12.4993 4.35883"
      stroke={cssVar(color === 'normal' ? 'weakTextColor' : 'weakerTextColor')}
      strokeWidth="1.28"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.07147 4.14461V3.50182C6.07147 2.55515 6.83887 1.78772 7.78557 1.78772H8.2141C9.16079 1.78772 9.9282 2.55515 9.9282 3.50182V4.14461"
      stroke={cssVar(
        color === 'normal' ? 'currentTextColor' : 'weakerTextColor'
      )}
      strokeWidth="1.28"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.00128 4.35883H14"
      stroke={cssVar(color === 'normal' ? 'weakTextColor' : 'weakerTextColor')}
      strokeWidth="1.28"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
