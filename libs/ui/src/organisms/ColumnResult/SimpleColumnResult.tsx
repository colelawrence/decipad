/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';
import { TableData } from '../../atoms';
import { TableRow } from '../../molecules';
import { CodeResult, Table, PaginationControl } from '..';
import { CodeResultProps } from '../../types';
import { cellLeftPaddingStyles } from '../../styles/table';
import { useSimplePagination } from '../../utils/usePagination';
import { useMaterializedResult } from '../../hooks';

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

export const SimpleColumnResult: FC<CodeResultProps<'materialized-column'>> = ({
  type,
  value,
  element,
}) => {
  const { page, valuesForPage, setPage } = useSimplePagination({
    all: useMaterializedResult(value),
    maxRowsPerPage: MAX_CELLS_PER_PAGE,
  });

  return (
    <Table
      isReadOnly={true}
      body={
        <>
          {valuesForPage.map((oneValue, index) => {
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
      footer={
        value.length > MAX_CELLS_PER_PAGE && (
          <TableRow key="pagination" readOnly={true} tableCellControls={false}>
            <td css={[paginationControlWrapperTdStyles, footerRowStyles]}>
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
