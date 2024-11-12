import { isFlagEnabled } from '@decipad/feature-flags';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { EditorController } from '@decipad/notebook-tabs';
import { FC } from 'react';
import { DataDrawerContainer } from './data-drawer';
import { DataDrawerNotebookPageWrapper } from './styles';
import { useNotebookMetaData } from '@decipad/react-contexts';

export const DataDrawer: FC<{ workspaceId: string }> = ({ workspaceId }) => {
  const [mode, computer, editor] = useNotebookWithIdState(
    (state) => [state.dataDrawerMode, state.computer, state.editor] as const
  );

  const isInEditorSidebar = useNotebookMetaData(
    (s) => s.sidebarComponent.type === 'annotations'
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

  return (
    <DataDrawerNotebookPageWrapper isInEditorSidebar={isInEditorSidebar}>
      <DataDrawerContainer workspaceId={workspaceId} />
    </DataDrawerNotebookPageWrapper>
  );
};
