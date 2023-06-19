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
  }, [computer, editor, element.children, path, result]);
};
