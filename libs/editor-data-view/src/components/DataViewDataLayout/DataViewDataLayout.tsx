import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { DataViewRow, PaginationControl, p13Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import { AggregationKind, Column } from '../../types';
import { treeToTable } from '../../utils/treeToTable';
import { useDataViewLayoutData } from '../../hooks';
import { DataViewDataGroupElement } from '../DataViewDataGroup';
import { DataViewTableHeader } from '..';
import { SmartCell } from '../SmartCell';

export interface DataViewLayoutProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
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
  tableName,
  columns,
  aggregationTypes,
  roundings,
  expandedGroups = [],
  onChangeExpandedGroups,
  rotate,
  headers,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData({
    tableName,
    columns,
    aggregationTypes,
    roundings,
    expandedGroups,
    includeTotal: true,
    preventExpansion: rotate,
    rotate,
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
          columnIndex: -1,
          previousColumns: [],
          replicaCount: 1,
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
            {row.map((element, elementIndex) => (
              <DataViewDataGroupElement
                key={`${table.indexOf(row)}-${index}-${elementIndex}}`}
                index={index}
                tableName={tableName}
                element={element}
                roundings={roundings}
                aggregationType={aggregationTypes[element.columnIndex]}
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
