import { cssVar } from '../../primitives';

interface AlignArrowRightProps {
  disabled?: boolean;
}

export const AlignArrowRight = ({ disabled = false }: AlignArrowRightProps) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Align Arrow Right</title>
    <path
      d="M3.16699 3.1665V12.8332"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83301 8H12.833"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 5.8335L12.8333 8.00016L10.5 10.1668"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
