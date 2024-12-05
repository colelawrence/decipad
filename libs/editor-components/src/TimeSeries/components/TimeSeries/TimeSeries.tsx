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
  DataViewMenu as TimeSeriesMenu,
  VariableNameSelector,
} from '@decipad/ui';
import { getNodeString } from '@udecode/plate-common';
import { Children, useEffect, useMemo } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { TimeSeriesContextProvider } from '../TimeSeriesContext';
import { DraggableBlock } from '../../../block-management';
import {
  getChildAtLevel,
  useTimeSeriesData,
} from '../../hooks/useTimeSeriesData';
import * as userIcons from 'libs/ui/src/icons/user-icons';
import { useDataView } from 'libs/editor-components/src/DataView/hooks';
import { useTimeSeriesLayoutData } from '../../hooks';

export const TimeSeries: PlateComponent<{ variableName: string }> = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TIME_SERIES);
  console.log('🚀 ~ element:', element);

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

  const timeSeriesData = useTimeSeriesData(element, sortedColumns);
  const numericalColumns = timeSeriesData?.data?.numericalColumns || [];
  const categoricalColumns = timeSeriesData?.data?.categoricalColumns || [];

  const groups = useTimeSeriesLayoutData({
    tableName,
    blockId: element.id,
    columns: sortedColumns,
    aggregationTypes: selectedAggregationTypes,
    roundings: selectedRoundings,
    filters: selectedFilters,
    expandedGroups: element.expandedGroups,
    includeTotal: true,
    preventExpansion: false,
  });
  console.log('🚀 ~ sortedColumns:', sortedColumns);

  // TODO GET AT numerical columns from unique values from first level of date children
  const firstCategorical = groups?.flatMap((group) =>
    group?.children.filter((x) => x.elementType === 'group').map((x) => x.value)
  );
  const uniqueFirstCategorical = [...new Set(firstCategorical)];
  const [caption, thead, addNewColumnComponent] = Children.toArray(children);
  console.log('🚀 ~ thead:', thead);

  const readOnly = useIsEditorReadOnly();

  const variableName = element.varName || '';
  const empty = isEmpty;
  const icon = (element.icon ?? 'TableSmall') as UserIconKey;
  const color = (element.color ?? defaultColor) as AvailableSwatchColor;

  const Icon = userIcons[icon];

  const availableNumericColumns = availableColumns
    ?.filter((x) => ['number', 'boolean'].includes(x.type.kind))
    .filter((x) => !numericalColumns.includes(x.name));

  const availableCategoricalColumns = availableColumns
    ?.filter((x) => ['string', 'date'].includes(x.type.kind))
    .filter((x) => !categoricalColumns.includes(x.name));

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

        {addNewColumnComponent}

        <>
          <table
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
                {/* <th css={{ background: 'whitesmoke' }}>Date</th> */}
                {categoricalColumns?.map((column, index) => (
                  <th css={{ background: 'whitesmoke' }} key={column}>
                    {column}
                  </th>
                ))}
                <th>
                  {!!availableCategoricalColumns?.length && (
                    <TimeSeriesMenu
                      availableColumns={availableCategoricalColumns}
                      onInsertColumn={onInsertColumn}
                    />
                  )}
                </th>
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
                numericalColumns?.map(
                  (numericColumnName, numericColumnNameIndex) =>
                    uniqueFirstCategorical?.map((category, categoryIndex) => {
                      return (
                        <tr>
                          {categoryIndex === 0 && (
                            <th
                              css={{ background: 'whitesmoke' }}
                              rowSpan={uniqueFirstCategorical.length}
                            >
                              {numericColumnName}
                            </th>
                          )}

                          {categoricalColumns?.map((column, colIndex) => {
                            // const uniqueValuesCount =

                            // if (!row[`${column}IsFirst`]) return null;

                            return (
                              <th
                                key={column}
                                // rowSpan={row[`${column}Span`]}
                              >
                                {category}
                              </th>
                            );
                          })}

                          {categoricalColumns?.map((column, colIndex) => {
                            // const uniqueValuesCount =

                            // if (!row[`${column}IsFirst`]) return null;

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
                                    numericColumnNameIndex + 1
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

          {!!availableNumericColumns?.length && (
            <TimeSeriesMenu
              availableColumns={availableNumericColumns}
              onInsertColumn={onInsertColumn}
            />
          )}
        </>
      </TimeSeriesContextProvider>
    </DraggableBlock>
  );
};
