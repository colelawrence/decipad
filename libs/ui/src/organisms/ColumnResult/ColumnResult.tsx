import { FC } from 'react';
import { css } from '@emotion/react';
import { useResults } from '@decipad/react-contexts';
import { cssVar, setCssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table } from '..';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { isTabularType } from '../../utils';

const rowLabelStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  color: cssVar('currentTextColor'),
  display: 'inline-block',
  lineHeight: 1.2,
});

export const ColumnResult = ({
  parentType,
  type,
  value,
}: CodeResultProps<'column'>): ReturnType<FC> => {
  const { indexedBy, cellType } = type;
  const { indexLabels } = useResults();
  const labels = indexLabels.get(indexedBy ?? '');

  return (
    <Table border={isTabularType(parentType) ? 'inner' : 'all'} translateX>
      {/* TODO: Column caption should say the name of the variable (if there is one. */}
      <tbody>
        {value.map((row, rowIndex) => {
          return (
            <TableRow key={rowIndex} readOnly>
              {labels && (
                <TableData as="td" showPlaceholder={false}>
                  <span css={[rowLabelStyles]}>{labels[rowIndex]}</span>
                </TableData>
              )}
              <TableData as="td" showPlaceholder={!labels}>
                <div
                  css={[
                    css(table.getCellWrapperStyles(type.cellType)),
                    // In case there is a nested dimension but no labels (ie. the nested dimension
                    // will render in the first column), we need to give it some space from the row
                    // number
                    !labels && table.cellLeftPaddingStyles,
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
