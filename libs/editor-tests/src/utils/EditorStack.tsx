import { MyEditor } from '@decipad/editor-types';
import { Editor } from '@decipad/editor';
import { FC } from 'react';
import { TeleportEditor } from '@decipad/editor-components';
import {
  ComputerContextProvider,
  EditorPasteInteractionMenuProvider,
  EditorUserInteractionsProvider,
} from '@decipad/react-contexts';
import { Computer } from '@decipad/computer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BehaviorSubject } from 'rxjs';
import { SessionProvider } from 'next-auth/react';

interface EditorStackProps {
  notebookId: string;
  editor: MyEditor;
  computer: Computer;
}

export const EditorStack: FC<EditorStackProps> = ({
  notebookId,
  editor,
  computer,
}) => {
  const remoteSaved = new BehaviorSubject<boolean>(false);
  return (
    <SessionProvider
      session={{
        user: {},
        expires: new Date(Date.now() + 100000000).toISOString(),
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <EditorUserInteractionsProvider>
          <EditorPasteInteractionMenuProvider>
            <ComputerContextProvider computer={computer}>
              <TeleportEditor editor={editor}>
                <Editor
                  notebookId={notebookId}
                  editor={editor}
                  loaded
                  readOnly={false}
                  isSavedRemotely={remoteSaved}
                ></Editor>
              </TeleportEditor>
            </ComputerContextProvider>
          </EditorPasteInteractionMenuProvider>
        </EditorUserInteractionsProvider>
      </DndProvider>
    </SessionProvider>
  );
};
