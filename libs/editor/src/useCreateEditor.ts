import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { Computer } from '@decipad/language';
import { createPlateEditor, PlateEditor } from '@udecode/plate';
import { useMemo } from 'react';
import * as configuration from './configuration';

export interface CreateEditorProps {
  notebookId: string;
  readOnly?: boolean;
  isWriter: boolean;
  computer: Computer;
}

export const useCreateEditor = ({
  notebookId,
  isWriter = true,
  computer,
}: CreateEditorProps): PlateEditor => {
  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookId,
    isWriter,
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
