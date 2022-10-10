import { ClientEventsContext } from '@decipad/client-events';
import { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { useContext, useMemo } from 'react';
import { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';
import * as configuration from './configuration';

export interface CreateEditorProps {
  notebookId: string;
  readOnly: boolean;
  computer?: Computer;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  interactions: Subject<UserInteraction>;
}

export const useCreateEditor = ({
  notebookId,
  readOnly = false,
  computer,
  notebookTitle,
  onNotebookTitleChange,
  interactions,
}: CreateEditorProps): MyEditor | undefined => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookTitle,
    onNotebookTitleChange,
    readOnly,
  });

  const events = useContext(ClientEventsContext);

  const editorPlugins = useMemo(
    () =>
      !computer || !events
        ? undefined
        : [
            ...configuration.plugins(computer, events, interactions),
            notebookTitlePlugin,
          ],
    [computer, notebookTitlePlugin, events, interactions]
  );

  const editor = useMemo(() => {
    const ed =
      editorPlugins &&
      createTPlateEditor({
        id: notebookId,
        plugins: editorPlugins,
        disableCorePlugins: { history: true },
      });
    if (ed) {
      (ed as DocSyncEditor).isDocSyncEnabled = true;
    }
    return ed;
  }, [editorPlugins, notebookId]);

  return editor;
};
