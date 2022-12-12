import { useCallback, useState } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_DATA_VIEW,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import {
  AvailableSwatchColor,
  UserIconKey,
  DataView as UIDataView,
  DataViewMenu,
  VoidBlock,
} from '@decipad/ui';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { DataViewData } from '../DataViewData';
import { useDataView } from '../../hooks';
import { WIDE_MIN_COL_COUNT } from '../../constants';

export const DataView: PlateComponent<{ variableName: string }> = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_DATA_VIEW);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorRef();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');
  const saveCollapsedGroups = useElementMutatorCallback(
    editor,
    element,
    'collapsedGroups'
  );

  const {
    variableNames,
    tableName,
    onDelete,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
    onInsertColumn,
    availableColumns,
  } = useDataView({
    editor,
    element,
  });

  const wideTable = (sortedColumns?.[0].length || 0) >= WIDE_MIN_COL_COUNT;

  const { color: defaultColor } = useEditorStylesContext();

  const onBlockDelete = useCallback(() => {
    setDeleted(true);
    onDelete();
  }, [onDelete]);

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
        icon={(element.icon ?? 'Table') as UserIconKey}
        color={(element.color ?? defaultColor) as AvailableSwatchColor}
        data={
          (sortedColumns && (
            <DataViewData
              tableName={tableName}
              columnNames={sortedColumns[0]}
              values={sortedColumns[2]}
              types={sortedColumns[1]}
              aggregationTypes={selectedAggregationTypes}
              collapsedGroups={element.collapsedGroups}
              onChangeCollapsedGroups={saveCollapsedGroups}
            />
          )) ||
          null
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
