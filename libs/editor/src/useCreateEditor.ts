import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { Computer } from '@decipad/computer';
import { useMemo } from 'react';
import { createTPlateEditor, MyEditor } from '@decipad/editor-types';
import * as configuration from './configuration';

export interface CreateEditorProps {
  editor?: MyEditor;
  notebookId: string;
  readOnly: boolean;
  computer?: Computer;
}

export const useCreateEditor = ({
  editor: slateEditor,
  notebookId,
  readOnly = false,
  computer,
}: CreateEditorProps) => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookId,
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
