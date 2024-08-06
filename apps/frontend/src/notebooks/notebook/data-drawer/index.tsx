import { FC } from 'react';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import {
  CreateVariableDataDrawer,
  EditVariableDataDrawer,
} from './data-drawer';
import { isFlagEnabled } from '@decipad/feature-flags';

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

  switch (isAddingOrEditingVariable) {
    case 'create':
      return (
        <CreateVariableDataDrawer
          computer={computer}
          controller={editor}
          mode={isAddingOrEditingVariable}
          onClose={closeDataDrawer}
        />
      );
    case 'edit':
      return (
        <EditVariableDataDrawer
          computer={computer}
          controller={editor}
          mode={isAddingOrEditingVariable}
          editingId={editingId!}
          onClose={closeDataDrawer}
        />
      );
  }
};
