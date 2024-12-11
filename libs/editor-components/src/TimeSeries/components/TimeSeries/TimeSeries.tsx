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
} from '@decipad/ui';
import { getNodeString } from '@udecode/plate-common';
import { Children, ReactNode, useEffect, useMemo } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { TimeSeriesContextProvider } from '../TimeSeriesContext';
import { DraggableBlock } from '../../../block-management';
import {
  getChildAtLevel,
  useTimeSeriesData,
} from '../../hooks/useTimeSeriesData';
import * as userIcons from 'libs/ui/src/icons/user-icons';
import {
  useDataView,
  useDataViewLayoutData,
} from 'libs/editor-components/src/DataView/hooks';
import { useTimeSeriesLayoutData } from '../../hooks';
import { TimeSeriesColumnHeader } from '../TimeSeriesColumnHeader';
import styled from '@emotion/styled';

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
  const wideTable = (sortedColumns?.length || 0) >= WIDE_MIN_COL_COUNT;

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
    deps: theadElement.children.map((x) => x.label).join(','),
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
      <TimeSeriesContextProvider columns={availableColumns}>
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

        <TableWrapper contentEditable={false}>
          {showTable && (
            <HorizontalScroll>
              <table
                style={{ opacity: computing ? 0.5 : 1 }}
                css={{
                  'th, td': {
                    border: '1px solid #eee',
                    padding: '4px 8px',
                    verticalAlign: 'middle',
                  },
                }}
                contentEditable={false}
              >
                <thead>
                  <tr>
                    {categoricalColumns?.map(
                      (header, index) =>
                        path && (
                          <th
                            css={{ background: 'whitesmoke' }}
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
                                categoricalColumns.length - 1 === index
                              }
                            />
                          </th>
                        )
                    )}

                    {/* Date headers */}
                    {groups
                      ?.filter((x) => x.elementType === 'group')
                      .map((date) => (
                        <td key={String(date.value)}>
                          {date?.type && (
                            <CodeResult
                              value={date.value}
                              variant="inline"
                              type={date?.type}
                              meta={undefined}
                              element={element}
                            />
                          )}
                        </td>
                      ))}
                  </tr>
                </thead>

                <tbody>
                  {uniqueFirstCategorical &&
                    numericalColumns?.map((numericColumn, numericColumnIndex) =>
                      uniqueFirstCategorical?.map((category, categoryIndex) => {
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
                              <th
                                css={{ background: 'whitesmoke' }}
                                rowSpan={uniqueFirstCategorical.length}
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
                                    showDelete={isTheLastColumn}
                                  />
                                )}
                              </th>
                            )}

                            {/* Categorical columns values */}
                            {categoricalColumnsLabels
                              ?.slice(1) // Ignores first date column.
                              .map((column) => {
                                return <th key={column}>{category}</th>;
                              })}

                            {/* Value cells */}
                            {categoricalColumnsLabels?.slice(1).map(() => {
                              return groups
                                ?.filter((x) => x.elementType === 'group')
                                .map((date) => {
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

                                  return (
                                    <td key={String(date.value)}>
                                      {item?.type && (
                                        <CodeResult
                                          value={item?.value}
                                          variant="inline"
                                          type={item?.type}
                                          meta={undefined}
                                          element={element}
                                        />
                                      )}
                                    </td>
                                  );
                                });
                            })}
                          </tr>
                        );
                      })
                    )}
                </tbody>
              </table>
            </HorizontalScroll>
          )}

          {showAddColumn && (
            <div css={{ position: 'sticky', top: '0', margin: -4 }}>
              <DataViewMenu
                availableColumns={availableCategoricalColumns}
                onInsertColumn={onInsertColumn}
              />
            </div>
          )}
        </TableWrapper>

        {/* Add numeric row */}
        {showAddRow && (
          <div css={{ position: 'sticky', top: '0', marginLeft: -8 }}>
            <DataViewMenu
              availableColumns={availableNumericColumns}
              onInsertColumn={onInsertColumn}
            />
          </div>
        )}
      </TimeSeriesContextProvider>
    </DraggableBlock>
  );
};

const TableWrapper = styled.div`
  position: relative;
  display: flex;
`;
const HorizontalScroll = styled.div`
  position: relative;
  max-width: 100%;
  overflow-y: auto;
`;
