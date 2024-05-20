import type { FC } from 'react';
import { EditorAssistantChat } from '@decipad/editor-ai-assistant';
import { useNotebookStateAndActions } from '../hooks';
import type { SidebarComponentProps } from './types';

const AssistantChat: FC<SidebarComponentProps> = ({
  notebookId,
  docsync,
  editor,
}) => {
  const actions = useNotebookStateAndActions({
    notebookId,
    docsync,
  });

  return (
    <EditorAssistantChat
      notebookId={notebookId}
      workspaceId={actions.notebook?.workspace?.id ?? ''}
      editor={editor}
    />
  );
};

export default AssistantChat;
