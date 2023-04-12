import { MyEditor, MyValue } from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { useCallback, useState } from 'react';

/**
 * Gets the top level blocks in the editor, that fit the provided type.
 */
export function useEditorElements<T extends MyValue[number]['type']>(
  type: T
): Array<Extract<MyValue[number], { type: typeof type }>> {
  const [liveConns, setLiveConns] = useState<
    Array<Extract<MyValue[number], { type: typeof type }>>
  >([]);

  useEditorChange(
    setLiveConns,
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

  return liveConns;
}
