import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import { unnestTableRows, DimensionExplanation } from '@decipad/computer';
import { all as allElements } from '@decipad/generator-utils';
import { useResolved } from '@decipad/react-utils';
import { cssVar, setCssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table, PaginationControl } from '..';
import { table } from '../../styles';
import { CodeResultProps } from '../../types';
import { cellLeftPaddingStyles } from '../../styles/table';
import { useSimplePagination } from '../../utils/usePagination';

const rowLabelStyles = css(cellLeftPaddingStyles, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  color: cssVar('currentTextColor'),
  display: 'inline-block',
  lineHeight: 1.2,
});

const paginationControlWrapperTdStyles = css({
  border: 0,
  padding: '6px 8px 6px 12px',
});

const footerRowStyles = css({
  backgroundColor: cssVar('tableFooterBackgroundColor'),
});

const MAX_CELLS_PER_PAGE = 10;

type LabeledColumnResultProps = CodeResultProps<'materialized-column'> & {
  labels: DimensionExplanation[];
};

export const LabeledColumnResult: FC<LabeledColumnResultProps> = ({
  type,
  value,
  element,
  labels,
}) => {
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

  const { page, offset, setPage } = useSimplePagination({
    all,
    maxRowsPerPage: MAX_CELLS_PER_PAGE,
  });

  return (
    <Table
      isReadOnly={true}
      body={
        <>
          {all
            .slice(offset, offset + MAX_CELLS_PER_PAGE)
            .map((matrixValue, index) => {
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
            })}
        </>
      }
      footer={
        value.length > MAX_CELLS_PER_PAGE && (
          <TableRow key="pagination" readOnly={true} tableCellControls={false}>
            <td
              colSpan={2}
              css={[paginationControlWrapperTdStyles, footerRowStyles]}
            >
              <PaginationControl
                page={page}
                onPageChange={setPage}
                startAt={1}
                maxPages={Math.ceil(value.length / MAX_CELLS_PER_PAGE)}
              />
            </td>
          </TableRow>
        )
      }
    />
  );
};
