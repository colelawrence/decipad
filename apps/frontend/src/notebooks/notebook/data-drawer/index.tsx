import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { FC } from 'react';
import { DataDrawerContainer } from './data-drawer';

export const DataDrawer: FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const [mode, computer, editor] = useNotebookWithIdState(
    (state) => [state.dataDrawerMode, state.computer, state.editor] as const
  );

  if (
    mode.type === 'closed' ||
    computer == null ||
    editor == null ||
    !(editor instanceof EditorController) ||
    !isFlagEnabled('DATA_DRAWER')
  ) {
    return null;
  }

  return <DataDrawerContainer workspaceId={workspaceId} />;
};
