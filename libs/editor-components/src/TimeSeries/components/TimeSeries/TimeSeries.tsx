import {
  useComputer,
  useIsBeingComputed,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type { PlateComponent, UserIconKey } from '@decipad/editor-types';
import { ELEMENT_TIME_SERIES, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import {
  useEditorStylesContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import type { AvailableSwatchColor } from '@decipad/ui';
import {
  CodeResult,
  IconPopover,
  TableToolbar,
  DataViewMenu,
  VariableNameSelector,
  TableSimple,
  TableCellSimple,
  TableHeadSimple,
  ellipsis,
} from '@decipad/ui';
import { getNodeString } from '@udecode/plate-common';
import { Children, useEffect, useMemo } from 'react';
import { DataViewContextProvider } from 'libs/editor-components/src/DataView/components/DataViewContext';
import { DraggableBlock } from '../../../block-management';
import * as userIcons from 'libs/ui/src/icons/user-icons';
import {
  useDataView,
  useDataViewLayoutData,
} from 'libs/editor-components/src/DataView/hooks';
import { TimeSeriesColumnHeader } from '../TimeSeriesColumnHeader';

import {
  dataViewTableWrapperStyles,
  dataViewTableOverflowStyles,
  stickyLeftColumn,
  stickySecondLeftColumn,
  textWidth,
  rightAddColumnWrapper,
  rightAddColumnWhenEmpty,
  tableScroll,
} from './time-series-styles';
import { getChildAtLevel } from './utils';

export const TimeSeries: PlateComponent<{ variableName: string }> = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TIME_SERIES);

  const readOnly = useIsEditorReadOnly();
  const [_caption, theadElement] = element.children;

  const editor = useMyEditorRef();
  const computer = useComputer();
  const computing = useIsBeingComputed(element.id);

  const path = useNodePath(element);
  const saveIcon = usePathMutatorCallback(editor, path, 'icon', 'TimeSeries');
  const saveColor = usePathMutatorCallback(editor, path, 'color', 'TimeSeries');
  const saveVarName = usePathMutatorCallback(
    editor,
    path,
    'varName',
    'TimeSeries'
  );

  const blockId = computer.getVarBlockId$.use(element.varName ?? '');
  useEffect(() => {
    if (blockId == null) return;
    saveVarName(blockId, 'migrating a missing smartRef to blockId');
  }, [computer, blockId, saveVarName]);

  const {
    error,
    variableNames,
    tableName,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
    selectedRoundings,
    onInsertColumn,
    availableColumns,
    selectedFilters,
  } = useDataView({
    editor,
    element,
  });

  if (error) console.error(error);

  const wideTable = true;

  const { color: defaultColor } = useEditorStylesContext();

  const isEmpty = useMemo(() => {
    return getNodeString(element.children[0]).length === 0;
  }, [element.children]);

  const categoricalColumns = theadElement.children.filter((x) =>
    ['string', 'boolean', 'date'].includes(x?.cellType?.kind)
  );
  const numericalColumns = theadElement.children.filter((x) =>
    ['number'].includes(x?.cellType?.kind)
  );

  const categoricalColumnsLabels = categoricalColumns.map((x) => x.label);
  const numericalColumnsLabels = numericalColumns.map((x) => x.label);

  const groups = useDataViewLayoutData({
    tableName: tableName ?? '',
    blockId: element.id,
    columns: sortedColumns ?? [],
    aggregationTypes: selectedAggregationTypes,
    roundings: selectedRoundings,
    filters: selectedFilters,
    expandedGroups: true,
    includeTotal: true,
    preventExpansion: false,
  });

  const firstCategorical = groups?.flatMap((group) =>
    group?.children
      .filter((x) => x.elementType === 'group')
      .map((x) => String(x.value))
  );
  const uniqueFirstCategorical = [...new Set(firstCategorical)];
  const [caption, thead] = Children.toArray(children);

  const variableName = element.varName || '';
  const empty = isEmpty;
  const icon = (element.icon ?? 'TableSmall') as UserIconKey;
  const color = (element.color ?? defaultColor) as AvailableSwatchColor;

  const Icon = userIcons[icon];

  const availableNumericColumns = availableColumns
    ?.filter((x) => ['number', 'boolean'].includes(x.type.kind))
    .filter((x) => !numericalColumnsLabels.includes(x.name) && !!x.blockId);

  const availableCategoricalColumns = availableColumns?.filter(
    (x) =>
      (categoricalColumnsLabels.length ? ['string'] : ['date']).includes(
        x.type.kind
      ) &&
      !!x.blockId &&
      !categoricalColumnsLabels.includes(x.name)
  );

  const hasSourceTable = !!tableName;
  const showAddColumn =
    hasSourceTable &&
    !!availableCategoricalColumns?.length &&
    categoricalColumnsLabels?.length < 2;
  const showAddRow =
    categoricalColumnsLabels.length > 1 && // It should have a date and a categorical column selected.
    !!availableNumericColumns?.length; // Must have at least one numeric column.

  const showTable = categoricalColumns.length + numericalColumns.length > 0;

  return (
    <DraggableBlock
      element={element}
      blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
      slateAttributes={attributes}
    >
      <DataViewContextProvider columns={availableColumns}>
        <TableToolbar
          isForWideTable={false}
          readOnly={readOnly}
          emptyLabel="Data view name..."
          empty={empty}
          actions={
            <>
              {!readOnly && (
                <VariableNameSelector
                  label=""
                  variableNames={variableNames}
                  selectedVariableName={variableName}
                  onChangeVariableName={onVariableNameChange}
                  testId="time-series-source"
                />
              )}
            </>
          }
          iconPopover={
            <IconPopover
              color={color as AvailableSwatchColor}
              trigger={
                <button>
                  <Icon />
                </button>
              }
              onChangeIcon={saveIcon}
              onChangeColor={saveColor}
            />
          }
          icon={icon}
          color={color}
          caption={caption}
        />

        <div style={{ display: 'none' }}>{thead}</div>

        <div css={{ position: 'relative' }}>
          <div css={dataViewTableWrapperStyles} contentEditable={false}>
            <div css={dataViewTableOverflowStyles} contentEditable={false} />

            <div css={tableScroll}>
              {showTable && (
                <TableSimple
                  style={{ opacity: computing ? 0.5 : 1 }}
                  contentEditable={false}
                >
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
                              dateIndex === length - 1 &&
                              !numericalColumns.length // When there's only header and no data.
                            }
                            key={String(date.value)}
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

                  <tbody>
                    {uniqueFirstCategorical &&
                      numericalColumns?.map(
                        (numericColumn, numericColumnIndex) =>
                          uniqueFirstCategorical?.map(
                            (category, categoryIndex) => {
                              const numericColumnRealIndex =
                                categoricalColumns.length + numericColumnIndex; // Assuming sequential indexes. First categorical then numerical.

                              const isTheLastColumn =
                                categoricalColumns.length +
                                  numericalColumns.length -
                                  1 ===
                                numericColumnRealIndex;

                              return (
                                <tr key={numericColumn.label + category}>
                                  {/* Numeric columns headers names */}
                                  {categoryIndex === 0 && (
                                    <TableHeadSimple
                                      isLeft={!categoryIndex}
                                      css={
                                        !categoryIndex
                                          ? stickyLeftColumn
                                          : undefined
                                      }
                                      isTop={categoryIndex === 0}
                                      bottomLeftRadius={
                                        numericColumnIndex ===
                                        numericalColumns.length - 1
                                      }
                                      rowSpan={uniqueFirstCategorical.length}
                                      data-sticky
                                    >
                                      {path && (
                                        <TimeSeriesColumnHeader
                                          element={numericColumn}
                                          attributes={{
                                            'data-slate-node': 'element',
                                            'data-slate-void': true,
                                            ref: undefined,
                                          }}
                                          overridePath={[
                                            ...path,
                                            1,
                                            numericColumnRealIndex,
                                          ]}
                                          showDelete
                                        />
                                      )}
                                    </TableHeadSimple>
                                  )}

                                  {/* Categorical columns values */}
                                  {categoricalColumnsLabels
                                    ?.slice(1) // Ignores first date column.
                                    .map((column) => {
                                      return (
                                        <TableHeadSimple
                                          isTop={categoryIndex === 0}
                                          css={[
                                            stickyLeftColumn,
                                            stickySecondLeftColumn,
                                          ]}
                                          data-sticky
                                          key={column}
                                        >
                                          <div css={[ellipsis, textWidth]}>
                                            {category}
                                          </div>
                                        </TableHeadSimple>
                                      );
                                    })}

                                  {/* Value cells */}
                                  {categoricalColumnsLabels
                                    ?.slice(1)
                                    .map(() => {
                                      return groups
                                        ?.filter(
                                          (x) => x.elementType === 'group'
                                        )
                                        .map((date, dateIndex, { length }) => {
                                          const child = date.children?.find(
                                            (x) => x.value === category
                                          );

                                          const item =
                                            child &&
                                            getChildAtLevel(
                                              child,
                                              0,
                                              numericColumnIndex + 1
                                            );

                                          const lastCell =
                                            numericColumnIndex ===
                                              numericalColumns.length - 1 &&
                                            categoryIndex ===
                                              uniqueFirstCategorical.length -
                                                1 &&
                                            dateIndex === length - 1;

                                          return (
                                            <TableCellSimple
                                              isTop={categoryIndex === 0}
                                              bottomRightRadius={lastCell}
                                              key={String(date.value)}
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
                            }
                          )
                      )}
                  </tbody>
                </TableSimple>
              )}
            </div>
          </div>

          {showAddColumn && (
            <div
              css={[
                rightAddColumnWrapper,
                showTable ? undefined : rightAddColumnWhenEmpty,
              ]}
            >
              <DataViewMenu
                availableColumns={availableCategoricalColumns}
                onInsertColumn={onInsertColumn}
              />
            </div>
          )}
        </div>

        {/* Add numeric row */}
        {showAddRow && (
          <div
            css={{
              position: 'sticky',
              top: '0',
              marginLeft: -8,
            }}
          >
            <DataViewMenu
              availableColumns={availableNumericColumns}
              onInsertColumn={onInsertColumn}
            />
          </div>
        )}
      </DataViewContextProvider>
    </DraggableBlock>
  );
};
