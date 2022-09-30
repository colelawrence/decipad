import type { Computer } from '@decipad/computer';
import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { UserInteraction } from '@decipad/react-contexts';
import { useMemo } from 'react';
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

  const editorPlugins = useMemo(
    () =>
      computer && [
        ...configuration.plugins(computer, interactions),
        notebookTitlePlugin,
      ],
    [computer, interactions, notebookTitlePlugin]
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
