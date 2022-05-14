import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { Computer } from '@decipad/language';
import { createPlateEditor, PlateEditor } from '@udecode/plate';
import { useMemo } from 'react';
import * as configuration from './configuration';

export interface CreateEditorProps {
  notebookId: string;
  readOnly: boolean;
  computer: Computer;
}

export const useCreateEditor = ({
  notebookId,
  readOnly = false,
  computer,
}: CreateEditorProps): PlateEditor => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookId,
    readOnly,
  });

  const editorPlugins = useMemo(
    () => [...configuration.plugins(computer), notebookTitlePlugin],
    [computer, notebookTitlePlugin]
  );

  const editor = useMemo(
    () =>
      createPlateEditor({
        id: notebookId,
        plugins: editorPlugins,
      }),
    [editorPlugins, notebookId]
  );

  return editor;
};
