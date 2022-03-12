import { Editor } from '@decipad/editor-types';
import { useStoreEditorRef as usePlateStoreEditorRef } from '@udecode/plate';

export const useStoreEditorRef = (id: string): Editor => {
  return usePlateStoreEditorRef(id) as unknown as Editor;
};
