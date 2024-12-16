import { TimeSeriesHeader, TimeSeriesElement } from '@decipad/editor-types';
import { TableHeadSimple, TableCellSimple, CodeResult } from '@decipad/ui';
import { DataGroup } from 'libs/editor-components/src/DataView/types';
import { Path } from 'slate';
import { TimeSeriesColumnHeader } from '../TimeSeriesColumnHeader';
import { stickyLeftColumn, stickySecondLeftColumn } from './time-series-styles';

type TimeSeriesHeadProps = {
  categoricalColumns: TimeSeriesHeader[];
  path?: Path;
  numericalColumns: TimeSeriesHeader[];
  groups: DataGroup[] | undefined;
  element: TimeSeriesElement;
};

export const TimeSeriesHead = ({
  categoricalColumns,
  path,
  numericalColumns,
  groups,

  element,
}: TimeSeriesHeadProps) => {
  return (
    <thead>
      <tr>
        {categoricalColumns?.map(
          (header, index) =>
            path && (
              <TableHeadSimple
                css={[
                  stickyLeftColumn,
                  index ? stickySecondLeftColumn : undefined,
                ]}
                isLeft={!index}
                topLeftRadius={!index}
                bottomLeftRadius={
                  !index && !numericalColumns.length // When there's only header and no data.
                }
                isTop
                key={header.label}
                style={{ zIndex: index ? 2 : 1 }}
              >
                <TimeSeriesColumnHeader
                  element={header}
                  attributes={{
                    'data-slate-node': 'element',
                    'data-slate-void': true,
                    ref: undefined,
                  }}
                  overridePath={[...path, 1, index]}
                  showDelete={
                    // Show delete only when is the last column and no numerical columns added yet.
                    categoricalColumns.length - 1 === index &&
                    !numericalColumns.length
                  }
                />
              </TableHeadSimple>
            )
        )}

        {/* Date headers */}
        {groups
          ?.filter((x) => x.elementType === 'group')
          .map((date, dateIndex, { length }) => (
            <TableCellSimple
              isTop
              topRightRadius={dateIndex === length - 1}
              bottomRightRadius={
                dateIndex === length - 1 && !numericalColumns.length // When there's only header and no data.
              }
              key={String(date.value)}
              style={{ position: 'relative', zIndex: 1 }}
            >
              {date?.type && (
                <CodeResult
                  value={date.value}
                  variant="inline"
                  type={date?.type}
                  meta={undefined}
                  element={element}
                />
              )}
            </TableCellSimple>
          ))}
      </tr>
    </thead>
  );
};
