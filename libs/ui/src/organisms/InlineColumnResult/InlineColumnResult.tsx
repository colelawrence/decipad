import { Fragment } from 'react';
import { CodeResult } from '../CodeResult/CodeResult';
import { CodeResultProps } from '../../types';
import { useMaterializedColumnResultValue } from '../../utils/useMaterializedColumnResultValue';

const maxElements = 3;

export const InlineColumnResult = ({
  value,
  type,
  element,
}: CodeResultProps<'materialized-column'>): ReturnType<React.FC> => {
  const { cellType } = type;

  const materializedValue = useMaterializedColumnResultValue(
    value,
    maxElements + 1
  );

  const maxPresent = Math.min(materializedValue?.length ?? 0, maxElements);

  if (!cellType) {
    return null;
  }

  return (
    <span>
      {materializedValue?.slice(0, maxPresent).map((row, rowIndex) => {
        return (
          <Fragment key={rowIndex}>
            <CodeResult
              value={row}
              variant="inline"
              type={cellType}
              element={element}
            />
            {rowIndex < materializedValue.length - 1 && ', '}
            {rowIndex === maxPresent - 1 &&
              materializedValue.length > maxElements &&
              '...'}
          </Fragment>
        );
      })}
    </span>
  );
};
