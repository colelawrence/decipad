/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import {
  unnestTableRows,
  type DimensionExplanation,
} from '@decipad/remote-computer';
import { all as allElements } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';
import { cssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table, PaginationControl } from '..';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { cellLeftPaddingStyles } from '../../styles/table';
import { useSimplePagination } from '../../utils/usePagination';

const rowLabelStyles = css(cellLeftPaddingStyles, {
  color: cssVar('textDefault'),
  display: 'inline-block',
  lineHeight: 1.2,
});

const paginationControlWrapperTdStyles = css({
  border: 0,
  padding: '6px 8px 6px 12px',
});

const footerRowStyles = css({
  backgroundColor: cssVar('backgroundDefault'),
});

const MAX_CELLS_PER_PAGE = 10;

type LabeledColumnResultProps = CodeResultProps<'materialized-column'> & {
  labels: DimensionExplanation[];
};

const targetPageSize = (labels: DimensionExplanation[]) => {
  const mult =
    labels.slice(1).reduce((acc, label) => acc * label.dimensionLength, 1) || 1;
  return Math.ceil(MAX_CELLS_PER_PAGE / mult) * mult;
};

export const LabeledColumnResult: FC<LabeledColumnResultProps> = ({
  type,
  value,
  element,
  labels,
}) => {
  const pageSize = targetPageSize(labels);
  const all =
    useResolved(
      useMemo(
        async () =>
          Array.from(
            await allElements(unnestTableRows(labels, { type, value }))
          ),
        [labels, type, value]
      )
    ) ?? [];

  const { page, setPage, valuesForPage } = useSimplePagination({
    all,
    maxRowsPerPage: pageSize,
  });

  return (
    <Table
      isReadOnly={true}
      body={
        <>
          {valuesForPage.map((matrixValue, index) => {
            return (
              <TableRow readOnly key={index}>
                {matrixValue.labelInfo.map((labelInfo, i) => {
                  return index === 0 ||
                    labelInfo.indexesOfRemainingLengthsAreZero ? (
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
                        {labelInfo.label ?? labelInfo.indexAtThisDimension + 1}
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
          })}
        </>
      }
      footer={
        all.length > pageSize && (
          <TableRow key="pagination" readOnly={true} tableCellControls={false}>
            <td
              colSpan={all.length}
              css={[paginationControlWrapperTdStyles, footerRowStyles]}
            >
              <PaginationControl
                page={page}
                onPageChange={setPage}
                startAt={1}
                maxPages={Math.ceil(all.length / pageSize)}
              />
            </td>
          </TableRow>
        )
      }
    />
  );
};
