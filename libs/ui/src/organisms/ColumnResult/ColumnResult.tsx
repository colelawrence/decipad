import { FC } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { CodeResultProps } from '../../types';
import { LabeledColumnResult } from './LabeledColumnResult';
import { SimpleColumnResult } from './SimpleColumnResult';

export const ColumnResult = ({
  type,
  value,
  element,
}: CodeResultProps<'materialized-column'>): ReturnType<FC> => {
  const computer = useComputer();

  const labels = computer.explainDimensions$.use({ type, value });

  return labels ? (
    <LabeledColumnResult
      labels={labels}
      type={type}
      value={value}
      element={element}
    />
  ) : (
    <SimpleColumnResult type={type} value={value} element={element} />
  );
};
