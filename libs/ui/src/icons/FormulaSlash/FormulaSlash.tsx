import { FC } from 'react';
import { cssVar } from '../../primitives';

export const FormulaSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>SlashCommandFormula</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <path
      d="M14.773 24.6951C15.175 26.8381 19.2736 27.4002 19.7421 23.9847C20.0419 21.7988 20.001 18.669 20.3133 16.392C20.4418 15.4551 21.1348 13.0783 25.1398 14.3236"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17 18H24"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
