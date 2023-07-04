import { ParagraphElement, useTEditorRef } from '@decipad/editor-types';
import { useNodePath, useSelection } from '@decipad/editor-hooks';
import { useWindowListener } from '@decipad/react-utils';
import { getEndPoint, getNodeString, isCollapsed } from '@udecode/plate';
import { setSelection } from '@decipad/editor-utils';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { BaseRange, Range, Location, Path } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { dequal } from '@decipad/utils';

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

  const { search, isInline, deleteFragment } = findSlashCommand(
    text,
    selection
  );
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

  const editor = useTEditorRef();
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
    deleteFragment,
    search,
  };
};

const findSlashCommand = (text: string, selection: BaseRange | null) => {
  const inline = findInlineSlashCommand(text, selection);
  const standalone = findStandaloneSlashCommand(text);

  return {
    isInline: inline != null,
    search: inline?.command ?? standalone,
    deleteFragment: inline?.selection,
  };
};

const findStandaloneSlashCommand = (text: string): string | undefined =>
  /^\/([a-z ]*)$/i.exec(text)?.[1];

const findInlineSlashCommand = (
  text: string,
  selection: BaseRange | null
): { command: string; selection: Range } | undefined => {
  if (!selection) return;
  if (!isCollapsed(selection)) return;
  if (text.startsWith('/')) return;

  const { offset } = selection.anchor;
  const leftSegment = text.slice(0, offset);
  const slashCommand = leftSegment.split('/').slice(1).at(-1);

  if (slashCommand == null) return;
  if (slashCommand.match(/\s/)) return;

  const cmdSelection: Range = {
    anchor: {
      offset: offset - slashCommand.length - 1,
      path: selection.anchor.path,
    },
    focus: { offset, path: selection.anchor.path },
  };

  return { command: slashCommand, selection: cmdSelection };
};
