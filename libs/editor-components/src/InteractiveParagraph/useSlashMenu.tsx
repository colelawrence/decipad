import { useNodePath, useSelection } from '@decipad/editor-hooks';
import { ParagraphElement, useMyEditorRef } from '@decipad/editor-types';
import { setSelection } from '@decipad/editor-utils';
import { useWindowListener } from '@decipad/react-utils';
import { dequal } from '@decipad/utils';
import { getEndPoint, getNodeString, isCollapsed } from '@udecode/plate-common';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Location, Path } from 'slate';
import { useFocused, useSelected } from 'slate-react';

interface UseSlashCommandMenuResult {
  showSlashCommands: boolean;
  menuRef: RefObject<HTMLDivElement>;
  elementPath?: Path;
  search?: string;
  deleteFragment?: Location;
}

export const useSlashMenu = (
  element: ParagraphElement
): UseSlashCommandMenuResult => {
  const selection = useSelection();
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

  const { search, isInline } = findSlashCommand(text);
  const showSlashCommands =
    selected && focused && !slashMenuSuppressed && search != null;

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

  const editor = useMyEditorRef();
  const selectionFocus = selection?.focus;
  const shouldJumpToEnd =
    !isInline && showSlashCommands && elementPath && isCollapsed(selection);

  useEffect(() => {
    if (shouldJumpToEnd) {
      const endPoint = getEndPoint(editor, elementPath);

      if (!dequal(selectionFocus, endPoint)) {
        setSelection(editor, {
          focus: endPoint,
          anchor: endPoint,
        });
      }
    }
  }, [editor, elementPath, selectionFocus, shouldJumpToEnd]);

  return {
    showSlashCommands,
    menuRef,
    elementPath: elementPath ?? undefined,
    search,
  };
};

const findSlashCommand = (text: string) => {
  const standalone = findStandaloneSlashCommand(text);

  return {
    isInline: false,
    search: standalone,
  };
};

const findStandaloneSlashCommand = (text: string): string | undefined =>
  /^\/([a-z- ]*)$/i.exec(text)?.[1];
