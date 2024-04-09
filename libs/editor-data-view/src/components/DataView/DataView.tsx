import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import type { PlateComponent, UserIconKey } from '@decipad/editor-types';
import { ELEMENT_DATA_VIEW, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorStylesContext } from '@decipad/react-contexts';
import type { AvailableSwatchColor } from '@decipad/ui';
import {
  DataView as UIDataView,
  DataViewMenu,
  VoidBlock,
  CodeError,
} from '@decipad/ui';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useDataView } from '../../hooks';
import { DataViewColumnHeader } from '../DataViewColumnHeader';
import { DataViewData } from '../DataViewData';
import { getNodeString } from '@udecode/plate-common';
import { DataViewContextProvider } from '../DataViewContext';
import { formatError } from '@decipad/format';

export const DataView: PlateComponent<{ variableName: string }> = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW);
  const editor = useMyEditorRef();

  const path = useNodePath(element);
  const saveIcon = usePathMutatorCallback(editor, path, 'icon', 'DataView');
  const saveColor = usePathMutatorCallback(editor, path, 'color', 'DataView');
  const saveExpandedGroups = usePathMutatorCallback(
    editor,
    path,
    'expandedGroups',
    'DataView'
  );
  const saveRotated = usePathMutatorCallback(
    editor,
    path,
    'rotate',
    'DataView'
  );
  const saveAlternateRotation = usePathMutatorCallback(
    editor,
    path,
    'alternateRotation',
    'DataView'
  );

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

  const rotate = element.rotate ?? false;
  const headers = useMemo((): ReactNode[] => {
    // optimization: these headers are only used on rotated data views
    if (!rotate || !path) {
      return [];
    }
    return element.children[1].children.map((header, index) => (
      <DataViewColumnHeader
        element={header}
        attributes={{
          'data-slate-node': 'element',
          'data-slate-void': true,
          ref: undefined,
        }}
        overridePath={[...path, 1, index]}
      />
    ));
  }, [element.children, rotate, path]);

  const data = useMemo(
    () =>
      error ? (
        <CodeError
          message={
            typeof error === 'string' ? error : formatError('en-US', error)
          }
        />
      ) : sortedColumns && tableName ? (
        <DataViewData
          element={element}
          tableName={tableName}
          columns={sortedColumns}
          aggregationTypes={selectedAggregationTypes}
          roundings={selectedRoundings}
          expandedGroups={element.expandedGroups}
          onChangeExpandedGroups={saveExpandedGroups}
          rotate={rotate}
          headers={headers}
          alternateRotation={element.alternateRotation ?? false}
          filters={selectedFilters}
        />
      ) : null,
    [
      element,
      error,
      headers,
      rotate,
      saveExpandedGroups,
      selectedAggregationTypes,
      selectedFilters,
      selectedRoundings,
      sortedColumns,
      tableName,
    ]
  );

  return (
    <DraggableBlock
      element={element}
      blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
      {...attributes}
    >
      <DataViewContextProvider columns={availableColumns}>
        <UIDataView
          availableVariableNames={variableNames}
          variableName={element.varName || ''}
          onChangeVariableName={onVariableNameChange}
          onChangeIcon={saveIcon}
          onChangeColor={saveColor}
          empty={isEmpty}
          icon={(element.icon ?? 'TableSmall') as UserIconKey}
          color={(element.color ?? defaultColor) as AvailableSwatchColor}
          onRotated={saveRotated}
          rotate={rotate}
          alternateRotation={element.alternateRotation ?? false}
          onChangeAlternateRotation={saveAlternateRotation}
          data={data}
        >
          {children}
          <VoidBlock>
            <DataViewMenu
              availableColumns={availableColumns}
              onInsertColumn={onInsertColumn}
            />
          </VoidBlock>
        </UIDataView>
      </DataViewContextProvider>
    </DraggableBlock>
  );
};
