import { ClientEventsContext } from '@decipad/client-events';
import { Computer } from '@decipad/computer';
import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { useContext, useMemo } from 'react';
import { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import * as configuration from './configuration';

export interface CreateEditorProps {
  editor?: MyEditor;
  notebookId: string;
  readOnly: boolean;
  computer?: Computer;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  interactions: Subject<UserInteraction>;
}

export const useCreateEditor = ({
  editor: slateEditor,
  notebookId,
  readOnly = false,
  computer,
  notebookTitle,
  onNotebookTitleChange,
  interactions,
}: CreateEditorProps) => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookTitle,
    onNotebookTitleChange,
    readOnly,
  });

  const events = useContext(ClientEventsContext);

  const editorPlugins = useMemo(
    () =>
      !computer || !events
        ? []
        : [
            ...configuration.plugins(computer, events, interactions),
            notebookTitlePlugin,
          ],
    [computer, notebookTitlePlugin, events, interactions]
  );

  const editor = useMemo(
    () =>
      slateEditor &&
      editorPlugins &&
      createTPlateEditor({
        id: notebookId,
        editor: slateEditor,
        plugins: editorPlugins,
        disableCorePlugins: { history: true },
      }),
    [slateEditor, editorPlugins, notebookId]
  );

  return editor;
};
