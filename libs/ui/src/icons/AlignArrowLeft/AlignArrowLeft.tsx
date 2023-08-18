import { cssVar } from '../../primitives';

interface AlignArrowLeftProps {
  disabled?: boolean;
}

export const AlignArrowLeft = ({ disabled = false }: AlignArrowLeftProps) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Align Arrow Left</title>
    <path
      d="M12.833 3.1665V12.8332"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.16699 8H10.167"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.50033 5.8335L3.16699 8.00016L5.50033 10.1668"
      stroke={disabled ? cssVar('iconColorDefault') : cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
