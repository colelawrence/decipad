import type { RemoteComputer } from '@decipad/remote-computer';
import { EditorController } from '@decipad/notebook-tabs';
import { editorPlugins } from './editorPlugins';

interface GetEditorOptions {
  notebookId: string;
  computer: RemoteComputer;
}

export const getEditor = async ({
  notebookId,
  computer,
}: GetEditorOptions): Promise<EditorController> =>
  new EditorController(notebookId, editorPlugins({ computer }));
