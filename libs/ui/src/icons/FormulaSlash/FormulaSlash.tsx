import { FC } from 'react';
import { cssVar } from '../../primitives';

export const FormulaSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>SlashCommandFormula</title>
    <rect width="40" height="40" rx="6" fill={cssVar('slashColorLight')} />
    <path
      d="M15.4852 24.0591C15.831 25.9024 19.3563 26.3859 19.7592 23.4481C20.0171 21.568 19.9819 18.876 20.2505 16.9175C20.361 16.1117 20.9571 14.0674 24.4018 15.1385"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M17.2861 18.6974H23.2166"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.39083"
      strokeLinecap="round"
    />
  </svg>
);
