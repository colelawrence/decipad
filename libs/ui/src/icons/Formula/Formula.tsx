import { FC } from 'react';
import { cssVar } from '../../primitives';

interface FormulaIconProps {
  strokeColor?: string;
}

export const Formula: FC<FormulaIconProps> = ({ strokeColor }) => {
  const currentStroke = strokeColor || cssVar('normalTextColor');
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Formula</title>
      <path
        d="M3.4852 12.0591C3.831 13.9024 7.35628 14.3859 7.75919 11.4481C8.01706 9.56797 7.98188 6.87604 8.25049 4.91755C8.36101 4.11169 8.95715 2.06737 12.4018 3.13846"
        stroke={currentStroke}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M5.28607 6.69739H11.2166"
        stroke={currentStroke}
        strokeWidth="1.39083"
        strokeLinecap="round"
      />
    </svg>
  );
};
