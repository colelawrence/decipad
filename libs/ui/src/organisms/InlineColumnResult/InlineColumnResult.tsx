import { Fragment } from 'react';
import { Interpreter } from '@decipad/language';
import { CodeResult } from '..';
import { ResultProps } from '../../lib/results';

export const InlineColumnResult = ({
  value,
  type,
}: ResultProps<'column'>): ReturnType<React.FC> => {
  const { cellType } = type;

  if (!cellType) {
    return null;
  }

  const columnValue = value as Interpreter.ResultColumn;
  return (
    <span>
      {columnValue.map((row, rowIndex) => {
        return (
          <Fragment key={rowIndex}>
            <CodeResult value={row} variant="inline" type={cellType} />
            {rowIndex < columnValue.length - 1 && ', '}
          </Fragment>
        );
      })}
    </span>
  );
};
