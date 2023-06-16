import {
  LiveConnectionElement,
  LiveDataSetElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useComputer } from '@decipad/react-contexts';
import { varNamify } from '@decipad/utils';
import { getNodeString, insertText } from '@udecode/plate';
import { useEffect, useRef } from 'react';
import { Path } from 'slate';

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
  const editor = useTEditorRef();
  const computer = useComputer();
  const mutated = useRef(false);

  // sync connection metadata title if needed
  useEffect(() => {
    if (path && result && !mutated.current) {
      const caption = element.children[0];
      const currentTitle = getNodeString(caption);
      if (
        (!currentTitle || currentTitle.startsWith('Name')) &&
        result.meta?.title
      ) {
        const newTitle = result.meta.title;
        mutated.current = true;
        insertText(
          editor,
          computer.getAvailableIdentifier(varNamify(newTitle), 1, true),
          { at: [...path, 0] }
        );
      }
    }
  }, [computer, editor, element.children, path, result]);
};
