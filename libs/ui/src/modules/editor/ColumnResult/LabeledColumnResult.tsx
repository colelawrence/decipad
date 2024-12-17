/* eslint decipad/css-prop-named-variable: 0 */
import { FC, useMemo } from 'react';
import { css } from '@emotion/react';
import {
  unnestTableRows,
  type DimensionExplanation,
  type ResultAndLabelInfo,
  buildResult,
  Result,
} from '@decipad/remote-computer';
import { all as allElements, count } from '@decipad/generator-utils';
import { useResolved, useSimplePagination } from '@decipad/react-utils';
import { componentCssVars, cssVar } from '../../../primitives';

import { table } from '../../../styles';
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
  background: componentCssVars('AiSendButtonBgColor'),
  marginRight: 8,
  borderRadius: 4,
  display: 'grid',
  placeItems: 'center',
});

const MAX_CELLS_PER_PAGE = 10;

type LabeledColumnResultProps = (
  | CodeResultProps<'materialized-column'>
  | CodeResultProps<'column'>
) & {
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
  meta,
  element,
  labels,
}) => {
  const pageSize = useMemo(() => targetPageSize(labels), [labels]);

  const all = useMemo(
    () => () =>
      unnestTableRows(
        labels,
        buildResult(type, value, meta) as
          | Result.Result<'materialized-column'>
          | Result.Result<'column'>
      ),
    [labels, meta, type, value]
  );

  const total = useResolved(useMemo(() => count(all()), [all])) ?? 0;

  const { page, setPage, valuesForPage } =
    useSimplePagination<ResultAndLabelInfo>(
      useMemo(
        () => ({
          all,
          maxRowsPerPage: pageSize,
        }),
        [all, pageSize]
      )
    );

  const materializedValuesForPage = useResolved(
    useMemo(() => allElements(valuesForPage()), [valuesForPage])
  );

  if (!materializedValuesForPage) {
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
          {materializedValuesForPage?.map((matrixValue, index) => {
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
                <TableData as="td" showPlaceholder={false}>
                  <span css={rowLabelStyles}>
                    <CodeResult
                      type={matrixValue.result.type}
                      value={matrixValue.result.value}
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
        total > pageSize && (
          <TableRow key="pagination" readOnly={true} tableCellControls={false}>
            <td
              colSpan={total}
              css={[paginationControlWrapperTdStyles, footerRowStyles]}
            >
              <PaginationControl
                page={page}
                onPageChange={setPage}
                startAt={1}
                maxPages={Math.ceil(total / pageSize)}
              />
            </td>
          </TableRow>
        )
      }
    />
  );
};
