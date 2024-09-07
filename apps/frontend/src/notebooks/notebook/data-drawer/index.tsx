import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { FC } from 'react';
import {
  CreateVariableDataDrawer,
  DataDrawerComponent,
  EditVariableDataDrawer,
} from './data-drawer';

export const DataDrawer: FC = () => {
  const [
    isAddingOrEditingVariable,
    editingId,
    closeDataDrawer,
    computer,
    editor,
  ] = useNotebookWithIdState(
    (state) =>
      [
        state.isAddingOrEditingVariable,
        state.editingVariableId,
        state.closeDataDrawer,
        state.computer,
        state.editor,
      ] as const
  );

  if (
    isAddingOrEditingVariable == null ||
    computer == null ||
    editor == null ||
    !(editor instanceof EditorController) ||
    !isFlagEnabled('DATA_DRAWER')
  ) {
    return null;
  }

  return (
    <DataDrawerComponent
      computer={computer}
      controller={editor}
      onClose={closeDataDrawer}
      title={isAddingOrEditingVariable === 'create' ? 'Add data' : 'Edit data'}
      isEditing={isAddingOrEditingVariable === 'edit'}
    >
      {isAddingOrEditingVariable === 'create' ? (
        <CreateVariableDataDrawer />
      ) : (
        <EditVariableDataDrawer editingId={editingId!} />
      )}
    </DataDrawerComponent>
  );
};
