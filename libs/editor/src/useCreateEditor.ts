import { useNotebookTitlePlugin } from '@decipad/editor-plugins';
import { Computer } from '@decipad/computer';
import { useMemo } from 'react';
import { createTPlateEditor } from '@decipad/editor-types';
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
}: CreateEditorProps) => {
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
      createTPlateEditor({
        id: notebookId,
        plugins: editorPlugins,
      }),
    [editorPlugins, notebookId]
  );

  return editor;
};
