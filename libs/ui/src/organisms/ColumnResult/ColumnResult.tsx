import { FC } from 'react';
import { css } from '@emotion/react';
import { Interpreter, Type } from '@decipad/language';
import { cssVar, setCssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table } from '..';
import { ResultTypeProps } from '../../lib/results';
import { useResults } from '../../lib/Contexts/Results';
import { table } from '../../styles';

function isNestedColumnOrTable(type: Type | undefined) {
  return type?.cellType?.cellType != null;
}

const rowLabelStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  color: cssVar('currentTextColor'),
});

const cellPaddingStyles = css({
  padding: `0 ${table.cellSidePadding}`,
});

const cellLeftPaddingStyles = css({
  paddingLeft: table.cellSidePadding,
});

export const ColumnResult = ({
  parentType,
  type,
  value,
}: ResultTypeProps): ReturnType<FC> => {
  const { indexLabels } = useResults();

  const { indexedBy, cellType } = type;

  if (!cellType) {
    return null;
  }

  return (
    <Table border={isNestedColumnOrTable(parentType) ? 'inner' : 'all'}>
      {/* TODO: Column caption should say the name of the variable (if there is one. */}
      <tbody>
        {(value as Interpreter.ResultColumn).map((row, rowIndex) => {
          const labels = indexLabels.get(indexedBy ?? '');

          return (
            <TableRow key={rowIndex} readOnly>
              {labels && (
                <TableData>
                  <span css={[rowLabelStyles, cellPaddingStyles]}>
                    {labels[rowIndex]}
                  </span>
                </TableData>
              )}
              <TableData>
                <div
                  css={[
                    { display: 'grid' },
                    !isNestedColumnOrTable(type) && cellPaddingStyles,
                    // In case there is a nested dimension but no labels (ie. the nested dimension
                    // will render in the first column), we need to give it some space from the row
                    // number
                    !labels && cellLeftPaddingStyles,
                  ]}
                >
                  <CodeResult
                    parentType={type}
                    type={cellType}
                    value={row}
                    variant="block"
                  />
                </div>
              </TableData>
            </TableRow>
          );
        })}
      </tbody>
    </Table>
  );
};
