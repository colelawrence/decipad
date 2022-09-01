import { ParagraphElement, useTEditorRef } from '@decipad/editor-types';
import { useNodePath, useSelection } from '@decipad/editor-utils';
import { useWindowListener } from '@decipad/react-utils';
import {
  getEndPoint,
  getNodeString,
  isCollapsed,
  setSelection,
} from '@udecode/plate';
import { dequal } from 'dequal';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Path } from 'slate';
import { useFocused, useSelected } from 'slate-react';

interface UseSlashCommandMenuResult {
  showSlashCommands: boolean;
  menuRef: RefObject<HTMLDivElement>;
  elementPath?: Path;
  search?: string;
}

export const useSlashMenu = (
  element: ParagraphElement
): UseSlashCommandMenuResult => {
  const selected = useSelected();
  const focused = useFocused();
  const text = getNodeString(element);
  const elementPath = useNodePath(element);

  const [slashMenuSuppressed, setSlashMenuSuppressed] = useState(true);
  // Show when changing text
  useEffect(() => {
    if (selected) {
      setSlashMenuSuppressed(false);
    }
    // intentionally only run when text changes while selected,
    // but not when only selection changes from false to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  // Suppress when selection moves out
  useEffect(() => {
    if (!selected) {
      setSlashMenuSuppressed(true);
    }
  }, [selected]);

  const search = /^\/([a-z ]*)$/i.exec(text)?.[1];
  const showSlashCommands =
    selected && focused && !slashMenuSuppressed && search !== undefined;

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    menuRef.current?.scrollIntoView({ block: 'nearest' });
  }, [showSlashCommands, search]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showSlashCommands && !event.shiftKey) {
        switch (event.key) {
          case 'Escape':
            setSlashMenuSuppressed(true);
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    },
    [showSlashCommands]
  );
  useWindowListener('keydown', onKeyDown, true);

  const selection = useSelection();
  const editor = useTEditorRef();

  useEffect(() => {
    if (showSlashCommands && elementPath && isCollapsed(selection)) {
      const endPoint = getEndPoint(editor, elementPath);
      if (!dequal(selection?.focus, endPoint)) {
        setSelection(editor, {
          focus: endPoint,
          anchor: endPoint,
        });
      }
    }
  }, [editor, elementPath, selection, selection?.focus, showSlashCommands]);

  return {
    showSlashCommands,
    menuRef,
    elementPath,
    search,
  };
};
