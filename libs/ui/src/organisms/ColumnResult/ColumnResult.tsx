import { FC } from 'react';
import { css } from '@emotion/react';
import { useComputer } from '@decipad/react-contexts';
import { unnestTableRows } from '@decipad/computer';
import { cssVar, setCssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table } from '..';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { cellLeftPaddingStyles } from '../../styles/table';

const rowLabelStyles = css(cellLeftPaddingStyles, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  color: cssVar('currentTextColor'),
  display: 'inline-block',
  lineHeight: 1.2,
});

export const ColumnResult = ({
  type,
  value,
  element,
}: CodeResultProps<'column'>): ReturnType<FC> => {
  const computer = useComputer();

  const labels = computer.explainDimensions$.use({ type, value });

  return labels ? (
    <Table
      isReadOnly={true}
      columnCount={labels[0].dimensionLength}
      body={
        <>
          {Array.from(unnestTableRows(labels, { type, value })).map(
            (matrixValue, index) => {
              return (
                <TableRow readOnly key={index}>
                  {matrixValue.labelInfo.map((labelInfo, i) => {
                    return labelInfo.indexesOfRemainingLengthsAreZero ? (
                      <TableData
                        key={i}
                        as="td"
                        rowSpan={labelInfo.productOfRemainingLengths}
                        showPlaceholder={false}
                        element={element}
                      >
                        <span
                          css={[
                            css(table.getCellWrapperStyles(type.cellType)),
                            // In case there is a nested dimension but no labels (ie. the nested dimension
                            // will render in the first column), we need to give it some space from the row
                            // number
                            !labels && table.cellLeftPaddingStyles,
                            rowLabelStyles,
                          ]}
                        >
                          {labelInfo.label ??
                            labelInfo.indexAtThisDimension + 1}
                        </span>
                      </TableData>
                    ) : null;
                  })}
                  <TableData as="td" showPlaceholder={false} element={element}>
                    <span css={rowLabelStyles}>
                      <CodeResult
                        type={matrixValue.result.type}
                        value={matrixValue.result.value}
                        element={element}
                      />
                    </span>
                  </TableData>
                </TableRow>
              );
            }
          )}
        </>
      }
    />
  ) : (
    <Table
      isReadOnly={true}
      columnCount={value.length}
      body={
        <>
          {value.map((oneValue, index) => {
            return (
              <TableRow readOnly key={index}>
                <TableData as="td" showPlaceholder={false} element={element}>
                  <span css={rowLabelStyles}>
                    <CodeResult
                      type={type.cellType}
                      value={oneValue}
                      element={element}
                    />
                  </span>
                </TableData>
              </TableRow>
            );
          })}
        </>
      }
    />
  );
};
