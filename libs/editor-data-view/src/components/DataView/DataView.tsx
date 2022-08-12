import { useState } from 'react';
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
import { organisms, AvailableSwatchColor, UserIconKey } from '@decipad/ui';
import { AutocompleteName } from '@decipad/computer';
import { DataViewData } from '../DataViewData';
import { useDataView } from '../../hooks';
import { WIDE_MIN_COL_COUNT } from '../../constants';

const isTable = (name: AutocompleteName): boolean => name.type.kind === 'table';
const varName = (name: AutocompleteName): string => name.name;

export const DataView: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_DATA_VIEW);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorRef();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

  const {
    variableNames,
    onDelete,
    onVariableNameChange,
    sortedColumns,
    selectedAggregationTypes,
  } = useDataView({
    editor,
    element,
  });

  const wideTable = (sortedColumns?.[0].length || 0) >= WIDE_MIN_COL_COUNT;

  return (
    <div {...attributes}>
      {!deleted && (
        <DraggableBlock
          element={element}
          blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
          onDelete={() => {
            setDeleted(true);
            onDelete();
          }}
        >
          <organisms.DataView
            availableVariableNames={variableNames.filter(isTable).map(varName)}
            variableName={element.varName || ''}
            onChangeVariableName={onVariableNameChange}
            onChangeIcon={saveIcon}
            onChangeColor={saveColor}
            icon={(element.icon ?? 'Table') as UserIconKey}
            color={(element.color ?? 'Catskill') as AvailableSwatchColor}
            data={
              (sortedColumns && (
                <DataViewData
                  values={sortedColumns[2]}
                  types={sortedColumns[1]}
                  aggregationTypes={selectedAggregationTypes}
                />
              )) ||
              null
            }
          >
            {children}
          </organisms.DataView>
        </DraggableBlock>
      )}
    </div>
  );
};
