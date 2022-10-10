import type { Computer } from '@decipad/computer';
import { DocSyncEditor } from '@decipad/docsync';
import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { UserInteraction } from '@decipad/react-contexts';
import { useMemo } from 'react';
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

  const editorPlugins = useMemo(
    () =>
      computer && [
        ...configuration.plugins(computer, interactions),
        notebookTitlePlugin,
      ],
    [computer, interactions, notebookTitlePlugin]
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
