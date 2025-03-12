import { TimeSeriesHeader, TimeSeriesElement } from '@decipad/editor-types';
import {
  TableHeadSimple,
  ellipsis,
  TableCellSimple,
  CodeResult,
} from '@decipad/ui';
import { DataGroup } from 'libs/editor-components/src/DataView/types';
import { BooleanResult } from 'libs/ui/src/modules/editor/BooleanResult/BooleanResult';
import { Path } from 'slate';
import { TimeSeriesColumnHeader } from '../TimeSeriesColumnHeader';
import {
  stickyLeftColumn,
  stickySecondLeftColumn,
  textWidth,
} from './time-series-styles';
import { getChildAtLevel } from './utils';
import { isElement } from '@udecode/plate-common';

type TimeSeriesBodyProps = {
  uniqueFirstCategorical: string[];
  numericalColumns: TimeSeriesHeader[];
  categoricalColumns: TimeSeriesHeader[];
  groups: DataGroup[] | undefined;
  element: TimeSeriesElement;
  path?: Path;
};

export const TimeSeriesBody = ({
  uniqueFirstCategorical,
  numericalColumns,
  categoricalColumns,
  path,
  groups,
  element,
}: TimeSeriesBodyProps) => {
  return (
    <tbody>
      {uniqueFirstCategorical &&
        numericalColumns?.map((numericColumn, numericColumnIndex) =>
          uniqueFirstCategorical?.map((category, categoryIndex) => {
            const numericColumnRealIndex =
              categoricalColumns.length + numericColumnIndex; // Assuming sequential indexes. First categorical then numerical.

            return (
              <tr key={numericColumn.label + category}>
                {/* Numeric columns headers names */}
                {categoryIndex === 0 && (
                  <TableHeadSimple
                    isLeft={!categoryIndex}
                    css={!categoryIndex ? stickyLeftColumn : undefined}
                    isTop={categoryIndex === 0}
                    bottomLeftRadius={
                      numericColumnIndex === numericalColumns.length - 1
                    }
                    rowSpan={uniqueFirstCategorical.length}
                    data-sticky
                  >
                    {path && isElement(numericColumn) && (
                      <TimeSeriesColumnHeader
                        element={numericColumn}
                        attributes={{
                          'data-slate-node': 'element',
                          'data-slate-void': true,
                          ref: undefined,
                        }}
                        overridePath={[...path, 1, numericColumnRealIndex]}
                        showDelete
                      />
                    )}
                  </TableHeadSimple>
                )}

                {/* Categorical columns values */}
                {categoricalColumns
                  ?.slice(1) // Ignores first date column.
                  .map((column) => {
                    return (
                      <TableHeadSimple
                        isTop={categoryIndex === 0}
                        css={[stickyLeftColumn, stickySecondLeftColumn]}
                        style={{ zIndex: 2 }}
                        data-sticky
                        key={column.label}
                      >
                        <div css={[ellipsis, textWidth]}>
                          {column.cellType.kind === 'boolean' ? (
                            <BooleanResult
                              value={category === 'true'}
                              type={{ kind: 'boolean' }}
                            />
                          ) : (
                            category
                          )}
                        </div>
                      </TableHeadSimple>
                    );
                  })}

                {/* Value cells */}
                {categoricalColumns?.slice(1).map(() => {
                  return groups
                    ?.filter((x) => x.elementType === 'group')
                    .map((date, dateIndex, { length }) => {
                      const child = date.children?.find(
                        (x) => String(x.value) === category
                      );

                      const item =
                        child &&
                        getChildAtLevel(child, 0, numericColumnIndex + 1);

                      const isLastCell =
                        numericColumnIndex === numericalColumns.length - 1 &&
                        categoryIndex === uniqueFirstCategorical.length - 1 &&
                        dateIndex === length - 1;

                      return (
                        <TableCellSimple
                          isTop={categoryIndex === 0}
                          bottomRightRadius={isLastCell}
                          key={String(date.value)}
                          style={{ position: 'relative', zIndex: 1 }}
                        >
                          {item?.type && (
                            <CodeResult
                              value={item?.value}
                              variant="inline"
                              type={item?.type}
                              meta={undefined}
                              element={element}
                            />
                          )}
                        </TableCellSimple>
                      );
                    });
                })}
              </tr>
            );
          })
        )}
    </tbody>
  );
};
