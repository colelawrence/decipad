import { FC } from 'react';
import { css } from '@emotion/react';
import { SerializedType } from '@decipad/language';
import { useResults } from '@decipad/react-contexts';
import { cssVar, setCssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table } from '..';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';

function isNestedColumnOrTable(type: SerializedType | undefined) {
  return type != null && (type.kind === 'column' || type.kind === 'table');
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
}: CodeResultProps<'column'>): ReturnType<FC> => {
  const { indexedBy, cellType } = type;
  const { indexLabels } = useResults();

  return (
    <Table border={isNestedColumnOrTable(parentType) ? 'inner' : 'all'}>
      {/* TODO: Column caption should say the name of the variable (if there is one. */}
      <tbody>
        {value.map((row, rowIndex) => {
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
                    !isNestedColumnOrTable(type.cellType) && cellPaddingStyles,
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
