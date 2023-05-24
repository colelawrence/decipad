import { Fragment } from 'react';
import { characterLimitStyles } from '../../styles/results';
import { CodeResultProps } from '../../types';
import { useMaterializedColumnResultValue } from '../../utils/useMaterializedColumnResultValue';
import { CodeResult } from '../CodeResult/CodeResult';

const maxElements = 3;

export const InlineColumnResult = ({
  value,
  type,
  element,
}: CodeResultProps<'materialized-column'>): ReturnType<React.FC> => {
  const { cellType } = type;

  const materializedValue = useMaterializedColumnResultValue(
    value,
    0,
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
              tooltip={false}
            />
            {rowIndex < materializedValue.length - 1 && (
              <span
                data-testid={`number-column-separator`}
                css={[characterLimitStyles, { maxWidth: '120px' }]}
              >
                ,{' '}
              </span>
            )}
            {rowIndex === maxPresent - 1 &&
              materializedValue.length > maxElements && (
                <span
                  data-testid={`number-column-ellipsis`}
                  css={[characterLimitStyles, { maxWidth: '120px' }]}
                >
                  …
                </span>
              )}
          </Fragment>
        );
      })}
    </span>
  );
};
