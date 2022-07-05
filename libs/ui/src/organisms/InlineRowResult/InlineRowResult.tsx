import { Fragment } from 'react';
import { CodeResult } from '../CodeResult/CodeResult';
import { CodeResultProps } from '../../types';

export const InlineRowResult = ({
  value,
  type,
  tooltip = true,
}: CodeResultProps<'row'>): ReturnType<React.FC> => {
  const { rowCellTypes } = type;

  return (
    <span>
      {value.map((column, colIndex) => {
        return (
          <Fragment key={colIndex}>
            <CodeResult
              value={column}
              variant="inline"
              type={rowCellTypes[colIndex]}
              tooltip={tooltip}
            />
            {colIndex < value.length - 1 && ', '}
          </Fragment>
        );
      })}
    </span>
  );
};
