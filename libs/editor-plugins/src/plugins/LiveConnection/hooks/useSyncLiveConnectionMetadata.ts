import { useComputer } from '@decipad/editor-hooks';
import type {
  LiveConnectionElement,
  LiveDataSetElement,
} from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import type { ImportResult } from '@decipad/import';
import { varNamify } from '@decipad/utils';
import { getNodeString, insertText } from '@udecode/plate-common';
import { useEffect, useRef } from 'react';
import type { Path } from 'slate';

interface UseSyncLiveConnectionMetadataProps {
  path?: Path;
  element: LiveConnectionElement | LiveDataSetElement;
  result?: ImportResult;
}

export const useSyncLiveConnectionMetadata = ({
  path,
  element,
  result,
}: UseSyncLiveConnectionMetadataProps) => {
  const editor = useMyEditorRef();
  const computer = useComputer();
  const mutated = useRef(false);

  // sync connection metadata title if needed
  useEffect(() => {
    (async () => {
      if (path && result && !mutated.current) {
        const caption = element.children[0];
        const currentTitle = getNodeString(caption);
        if (!currentTitle && result.meta?.title) {
          const newTitle = result.meta.title;
          if (currentTitle.includes(newTitle)) return;
          mutated.current = true;
          insertText(
            editor,
            computer.getAvailableIdentifier(varNamify(newTitle)),
            { at: [...path, 0] }
          );
        }
      }
    })();
  }, [computer, editor, element.children, path, result]);
};
