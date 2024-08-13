/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import { getResultGenerator, Result } from '@decipad/remote-computer';
import { useResolved, useSimplePagination } from '@decipad/react-utils';
import { all as allEntries, count } from '@decipad/generator-utils';
import { cssVar } from '../../../primitives';
import { CodeResultProps } from '../../../types';
import { cellLeftPaddingStyles } from '../../../styles/table';
import { Table } from '../Table/Table';
import { TableRow } from '../TableRow/TableRow';
import { TableData } from '../TableData/TableData';
import { CodeResult } from '..';
import { PaginationControl, Spinner } from '../../../shared';

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

const spinnerCss = css({
  width: 24,
  height: 24,
  padding: 0,
  marginRight: 8,
  borderRadius: 4,
  display: 'grid',
  placeItems: 'center',
});

const MAX_CELLS_PER_PAGE = 10;

export const SimpleColumnResult: FC<
  CodeResultProps<'column'> | CodeResultProps<'materialized-column'>
> = ({ type, value, meta, element }) => {
  const all = useMemo(
    (): Result.ResultColumn => getResultGenerator(value),
    [value]
  );
  const totalCount = useResolved(useMemo(() => count(all()), [all])) ?? 0;
  const { page, valuesForPage, setPage } = useSimplePagination(
    useMemo(
      () => ({
        all,
        maxRowsPerPage: MAX_CELLS_PER_PAGE,
      }),
      [all]
    )
  );

  const materializedResultsForPage = useResolved(
    useMemo(() => allEntries(valuesForPage()), [valuesForPage])
  );

  if (!materializedResultsForPage) {
    return (
      <div css={spinnerCss}>
        <Spinner />
      </div>
    );
  }

  return (
    <Table
      isReadOnly={true}
      body={
        <>
          {materializedResultsForPage.map((oneValue, index) => {
            return (
              <TableRow readOnly key={index}>
                <TableData as="td" showPlaceholder={false}>
                  <span css={rowLabelStyles}>
                    <CodeResult
                      type={type.cellType}
                      value={oneValue as Result.Result['value']}
                      meta={meta}
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
                maxPages={Math.ceil(totalCount / MAX_CELLS_PER_PAGE)}
              />
            </td>
          </TableRow>
        )
      }
    />
  );
};
