import { Computer } from '@decipad/computer';
import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import { useMemo } from 'react';
import * as configuration from './configuration';

export interface CreateEditorProps {
  editor?: MyEditor;
  notebookId: string;
  readOnly: boolean;
  computer?: Computer;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
}

export const useCreateEditor = ({
  editor: slateEditor,
  notebookId,
  readOnly = false,
  computer,
  notebookTitle,
  onNotebookTitleChange,
}: CreateEditorProps) => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookTitle,
    onNotebookTitleChange,
    readOnly,
  });

  const editorPlugins = useMemo(
    () => computer && [...configuration.plugins(computer), notebookTitlePlugin],
    [computer, notebookTitlePlugin]
  );

  const editor = useMemo(
    () =>
      slateEditor &&
      editorPlugins &&
      createTPlateEditor({
        id: notebookId,
        editor: slateEditor,
        plugins: editorPlugins,
      }),
    [slateEditor, editorPlugins, notebookId]
  );

  return editor;
};
