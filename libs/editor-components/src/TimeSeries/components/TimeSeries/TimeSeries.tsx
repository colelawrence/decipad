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
  IconPopover,
  TableToolbar,
  DataViewMenu,
  VariableNameSelector,
  TableSimple,
  Alert,
  AlertTitle,
  ErrorBlock,
} from '@decipad/ui';
import { getNodeString, removeNodes } from '@udecode/plate-common';
import { Children, useEffect, useMemo } from 'react';
import { DataViewContextProvider } from 'libs/editor-components/src/DataView/components/DataViewContext';
import { DraggableBlock } from '../../../block-management';
import * as userIcons from 'libs/ui/src/icons/user-icons';
import {
  useDataView,
  useDataViewLayoutData,
} from 'libs/editor-components/src/DataView/hooks';

import {
  dataViewTableWrapperStyles,
  dataViewTableOverflowStyles,
  rightAddColumnWrapper,
  rightAddColumnWhenEmpty,
  tableScroll,
  addNumericRowButtonStyles,
  stickyWrapper,
} from './time-series-styles';
import { TimeSeriesHead } from './TimeSeriesHead';
import { TimeSeriesBody } from './TimeSeriesBody';
import { formatError } from '@decipad/format';
import { useTimeSeriesData } from './useTimeSeriesData';

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

  if (error) console.error('useDataView error:', error);

  const { color: defaultColor } = useEditorStylesContext();

  const isEmpty = useMemo(() => {
    return getNodeString(element.children[0]).length === 0;
  }, [element.children]);

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
  const [caption, thead] = Children.toArray(children);

  const variableName = element.varName || '';
  const icon = (element.icon ?? 'TableSmall') as UserIconKey;
  const color = (element.color ?? defaultColor) as AvailableSwatchColor;
  const Icon = userIcons[icon];

  const {
    showTable,
    categoricalColumns,
    numericalColumns,
    uniqueFirstCategorical,
    showAddColumn,
    availableCategoricalColumns,
    hasSourceTable,
    hasDateColumn,
    hasCategoricalColumn,
    hasNumericalColumn,
    showAddRow,
    availableNumericColumns,
  } = useTimeSeriesData({ theadElement, groups, availableColumns, tableName });

  return (
    <DraggableBlock
      element={element}
      blockKind="editorWideTable"
      slateAttributes={attributes}
    >
      <DataViewContextProvider columns={availableColumns}>
        <TableToolbar
          isForWideTable={false}
          readOnly={readOnly}
          emptyLabel="Time series name..."
          empty={isEmpty}
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
        <div contentEditable={false}>
          <div style={{ display: 'none' }}>{thead}</div>

          {error && (
            <div css={{ marginBottom: 8 }}>
              <ErrorBlock
                type="error"
                onDelete={() => {
                  path &&
                    removeNodes(editor, {
                      at: [path[0]],
                    });
                }}
                message={`\n\n${
                  typeof error === 'string'
                    ? error
                    : formatError('en-US', error)
                }`}
              />
            </div>
          )}

          {
            <>
              <div css={stickyWrapper}>
                <div css={dataViewTableWrapperStyles}>
                  <div css={dataViewTableOverflowStyles} />

                  <div css={tableScroll}>
                    {showTable && (
                      <TableSimple style={{ opacity: computing ? 0.5 : 1 }}>
                        <TimeSeriesHead
                          categoricalColumns={categoricalColumns}
                          numericalColumns={numericalColumns}
                          path={path}
                          groups={groups}
                          element={element}
                        />

                        <TimeSeriesBody
                          uniqueFirstCategorical={uniqueFirstCategorical}
                          numericalColumns={numericalColumns}
                          categoricalColumns={categoricalColumns}
                          path={path}
                          groups={groups}
                          element={element}
                        />
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

              {!readOnly && !computing && hasSourceTable && (
                <div style={{ paddingTop: 16 }}>
                  {!hasDateColumn ? (
                    <Alert>
                      <AlertTitle>
                        <p>
                          The selected table &ldquo;{tableName}&rdquo; does not
                          contain a date column.
                        </p>
                      </AlertTitle>
                    </Alert>
                  ) : !hasCategoricalColumn ? (
                    <Alert>
                      <AlertTitle>
                        <span>
                          The selected table &ldquo;{tableName}&rdquo; does not
                          contain a text or checkbox column.
                        </span>
                      </AlertTitle>
                    </Alert>
                  ) : (
                    !hasNumericalColumn && (
                      <Alert>
                        <AlertTitle>
                          <span>
                            The selected table &ldquo;{tableName}&rdquo; does
                            not contain a numeric value column.
                          </span>
                        </AlertTitle>
                      </Alert>
                    )
                  )}
                </div>
              )}

              {/* Add numeric row */}
              {showAddRow && (
                <div css={addNumericRowButtonStyles}>
                  <DataViewMenu
                    availableColumns={availableNumericColumns}
                    onInsertColumn={onInsertColumn}
                  />
                </div>
              )}
            </>
          }
        </div>
      </DataViewContextProvider>
    </DraggableBlock>
  );
};
