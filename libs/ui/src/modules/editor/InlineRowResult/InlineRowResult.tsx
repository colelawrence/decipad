import { Fragment } from 'react';
import { type Result } from '@decipad/remote-computer';
import { CodeResult } from '..';
import { CodeResultProps } from '../../../types';

export const InlineRowResult = ({
  value,
  type,
  tooltip = true,
  element,
}: CodeResultProps<'row'>): ReturnType<React.FC> => {
  const { rowCellTypes } = type;

  return (
    <span>
      {value.map((column, colIndex) => {
        return (
          <Fragment key={colIndex}>
            <CodeResult
              value={column as Result.Result['value']}
              variant="inline"
              type={rowCellTypes[colIndex]}
              tooltip={tooltip}
              element={element}
            />
            {colIndex < value.length - 1 && ', '}
          </Fragment>
        );
      })}
    </span>
  );
};
