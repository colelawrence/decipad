import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import {
  DataViewRow,
  PaginationControl,
  p13Medium,
  PendingResult,
} from '@decipad/ui';
import type { DataViewElement, DataViewFilter } from '@decipad/editor-types';
import type { AggregationKind, Column } from '../../types';
import { treeToTable } from '../../utils/treeToTable';
import { useDataViewLayoutData } from '../../hooks';
import { DataViewDataGroupElement } from '../DataViewDataGroup';
import { SmartCell } from '../SmartCell';
import { DataViewTableHeader } from '../DataViewTableHeader/DataViewTableHeader';
import { Unknown } from '@decipad/language-interfaces';
import { getAggregationShortName } from '@decipad/language-aggregations';

export interface DataViewLayoutProps {
  element: DataViewElement;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
}

const MAX_PAGE_SIZE = 60;
const paginationExplanationStyles = css(p13Medium, {
  lineHeight: '24px',
});
const paginationWrapperStyles = css({
  display: 'flex',
  flexDirection: 'row',
});

export const DataViewDataLayout: FC<DataViewLayoutProps> = ({
  element,
  tableName,
  columns,
  aggregationTypes,
  roundings,
  filters,
  expandedGroups = [],
  onChangeExpandedGroups,
  rotate,
  headers,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData({
    tableName,
    blockId: element.id,
    columns,
    aggregationTypes,
    roundings,
    filters,
    expandedGroups,
    includeTotal: true,
    preventExpansion: rotate,
  });

  const [page, setPage] = useState(1);
  const pageGroups = useMemo(() => {
    if (!groups) {
      return [];
    }
    const offset = (page - 1) * MAX_PAGE_SIZE;
    return groups.slice(offset, offset + MAX_PAGE_SIZE);
  }, [groups, page]);

  useEffect(() => {
    if (pageGroups.length === 0 && page > 1) {
      setPage(1);
    }
  }, [page, pageGroups.length]);

  const table = useMemo(
    () =>
      treeToTable(
        {
          elementType: 'group',
          children: pageGroups,
          aggregationResult: undefined,
          aggregationExpression: undefined,
          aggregationVariableName: undefined,
        },
        {
          rotate,
        }
      ),
    [pageGroups, rotate]
  );

  const cols = useMemo(
    () =>
      table.map((row) => {
        return row.reduce((previous, current) => {
          const colspan = current && current.colspan ? current.colspan : 0;
          return previous + colspan;
        }, 0);
      }),
    [table]
  );

  const maxCols = Math.max(...cols);

  const maxPages = useMemo(
    () => (groups ? Math.ceil(groups.length / MAX_PAGE_SIZE) : 0),
    [groups]
  );

  if (!table.length && columns.length > 0) {
    return <PendingResult type={{ kind: 'pending' }} value={Unknown} />;
  }

  return (
    <>
      {table.map((row, index) => {
        return (
          <DataViewRow
            key={`${table.indexOf(row)}-${index}}`}
            isFullWidth={row.length === maxCols}
            isBeforeFullWidthRow={
              table[index + 1] && table[index + 1].length === maxCols
            }
            global={row.some((r) => r.global)}
            rotate={rotate}
          >
            {rotate && headers[index]}
            {row.map((cell, cellIndex) => (
              <DataViewDataGroupElement
                key={`${table.indexOf(row)}-${index}-${cellIndex}}`}
                index={index}
                element={cell}
                aggregationType={getAggregationShortName(
                  aggregationTypes[cellIndex]
                )}
                Header={DataViewTableHeader}
                SmartCell={SmartCell}
                isFullWidthRow={row.length === maxCols}
                expandedGroups={expandedGroups}
                onChangeExpandedGroups={onChangeExpandedGroups}
                groupLength={row.length}
                rotate={rotate}
                isFirstLevel={index === 0}
              />
            ))}
          </DataViewRow>
        );
      })}
      {groups && groups.length > MAX_PAGE_SIZE && (
        <tr>
          <td colSpan={maxCols}>
            <div css={paginationWrapperStyles}>
              <PaginationControl
                page={page}
                startAt={1}
                maxPages={maxPages}
                onPageChange={setPage}
              />
              <span css={paginationExplanationStyles}>
                Page {page} of {maxPages}
              </span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
