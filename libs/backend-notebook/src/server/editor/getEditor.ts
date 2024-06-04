import type { Computer } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  type RootEditorController,
  EditorController,
} from '@decipad/notebook-tabs';
import { editorPlugins } from './editorPlugins';

interface GetEditorOptions {
  notebookId: string;
  computer: Computer;
}

export const getEditor = async ({
  notebookId,
  computer,
}: GetEditorOptions): Promise<RootEditorController> => {
  return new EditorController(notebookId, editorPlugins({ computer }));
};
