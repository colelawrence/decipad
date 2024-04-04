import type { MyEditor, MyValue } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/editor-hooks';
import { useCallback } from 'react';

/**
 * Gets the top level blocks in the editor, that fit the provided type.
 */
export function useEditorElements<T extends MyValue[number]['type']>(
  type: T
): Array<Extract<MyValue[number], { type: typeof type }>> {
  return useEditorChange(
    useCallback(
      (editor: MyEditor) => {
        return editor.children.filter(
          (c): c is Extract<MyValue[number], { type: typeof type }> =>
            c.type === type
        );
      },
      [type]
    )
  );
}
