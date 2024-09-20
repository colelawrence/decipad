import { useNodePath } from '@decipad/editor-hooks';
import type { ParagraphElement } from '@decipad/editor-types';
import { useWindowListener } from '@decipad/react-utils';
import { getNodeString } from '@udecode/plate-common';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { Location, Path } from 'slate';
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
  const selected = useSelected();
  const focused = useFocused();

  const text = getNodeString(element);
  const elementPath = useNodePath(element);

  const search = findStandaloneSlashCommand(text);
  const showSlashCommands = selected && focused && search != null;

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    menuRef.current?.scrollIntoView({ block: 'nearest' });
  }, [showSlashCommands, search]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showSlashCommands || event.shiftKey) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          event.stopPropagation();
          event.preventDefault();
          break;
      }
    },
    [showSlashCommands]
  );
  useWindowListener('keydown', onKeyDown, true);

  return {
    showSlashCommands,
    menuRef,
    elementPath,
    search,
  };
};

const findStandaloneSlashCommand = (text: string): string | undefined =>
  /^\/([a-z- ]*)$/i.exec(text)?.[1];
