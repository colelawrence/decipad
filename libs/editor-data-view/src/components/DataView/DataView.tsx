import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  ELEMENT_DATA_VIEW,
  PlateComponent,
  UserIconKey,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useEditorStylesContext } from '@decipad/react-contexts';
import {
  AvailableSwatchColor,
  DataViewMenu,
  DataView as UIDataView,
  VoidBlock,
} from '@decipad/ui';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useDataView } from '../../hooks';
import { DataViewColumnHeader } from '../DataViewColumnHeader';
import { DataViewData } from '../DataViewData';

export const DataView: PlateComponent<{ variableName: string }> = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorRef();

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
    variableNames,
    tableName,
    onDelete,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
    selectedRoundings,
    onInsertColumn,
    availableColumns,
  } = useDataView({
    editor,
    element,
  });
  const wideTable = (sortedColumns?.length || 0) >= WIDE_MIN_COL_COUNT;

  const { color: defaultColor } = useEditorStylesContext();

  const onBlockDelete = useCallback(() => {
    setDeleted(true);
    onDelete();
  }, [onDelete]);

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

  return !deleted ? (
    <DraggableBlock
      element={element}
      blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
      onDelete={onBlockDelete}
      {...attributes}
    >
      <UIDataView
        availableVariableNames={variableNames}
        variableName={element.varName || ''}
        onChangeVariableName={onVariableNameChange}
        onChangeIcon={saveIcon}
        onChangeColor={saveColor}
        icon={(element.icon ?? 'TableSmall') as UserIconKey}
        color={(element.color ?? defaultColor) as AvailableSwatchColor}
        onRotated={saveRotated}
        rotate={rotate}
        alternateRotation={element.alternateRotation ?? false}
        onChangeAlternateRotation={saveAlternateRotation}
        data={
          sortedColumns && tableName ? (
            <DataViewData
              tableName={tableName}
              columns={sortedColumns}
              aggregationTypes={selectedAggregationTypes}
              roundings={selectedRoundings}
              expandedGroups={element.expandedGroups}
              onChangeExpandedGroups={saveExpandedGroups}
              rotate={rotate}
              headers={headers}
              alternateRotation={element.alternateRotation ?? false}
            />
          ) : null
        }
      >
        {children}
        <VoidBlock>
          <DataViewMenu
            availableColumns={availableColumns}
            onInsertColumn={onInsertColumn}
          />
        </VoidBlock>
      </UIDataView>
    </DraggableBlock>
  ) : null;
};
