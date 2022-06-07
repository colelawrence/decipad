import { useState } from 'react';
import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_POWER_TABLE,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { organisms, AvailableSwatchColor, UserIconKey } from '@decipad/ui';
import { AutocompleteName } from '@decipad/computer';
import { PowerTableData } from '../PowerTableData';
import { usePowerTable } from '../../hooks';
import { WIDE_MIN_COL_COUNT } from '../../constants';

const isTable = (name: AutocompleteName): boolean => name.type.kind === 'table';
const varName = (name: AutocompleteName): string => name.name;

export const PowerTable: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_POWER_TABLE);
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
  } = usePowerTable({
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
          <organisms.PowerTable
            availableVariableNames={variableNames.filter(isTable).map(varName)}
            variableName={element.varName || ''}
            onChangeVariableName={onVariableNameChange}
            onChangeIcon={saveIcon}
            onChangeColor={saveColor}
            icon={(element.icon ?? 'Table') as UserIconKey}
            color={(element.color ?? 'Catskill') as AvailableSwatchColor}
            data={
              (sortedColumns && (
                <PowerTableData
                  values={sortedColumns[2]}
                  types={sortedColumns[1]}
                  aggregationTypes={selectedAggregationTypes}
                />
              )) ||
              null
            }
          >
            {children}
          </organisms.PowerTable>
        </DraggableBlock>
      )}
    </div>
  );
};
