import { useStoreEditorRef as plateUseStoreEditorRef } from '@udecode/plate';
import { Editor } from '@decipad/editor-types';

export function useStoreEditorRef(id: string): Editor {
  return plateUseStoreEditorRef(id) as unknown as Editor;
}
