import { useCallback, useEffect, useState } from 'react';
import { useObservable } from 'rxjs-hooks';
import {
  isInteractionOfType,
  useComputer,
  useEditorUserInteractions,
  useEditorUserInteractionsContext,
  UserInteraction,
} from '@decipad/react-contexts';
import { useSelected } from 'slate-react';
import {
  ImportElementSource,
  MyElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useWindowListener } from '@decipad/react-utils';
import {
  findNode,
  findNodePath,
  getNodeString,
  insertText,
  isText,
  removeNodes,
} from '@udecode/plate';
import { insertImport } from './insertImport';
import { insertLiveConnection } from './insertLiveConnection';

interface UseInteractiveMenuResult {
  showInteractionMenu: boolean;
  source?: ImportElementSource;
  onInteractionMenuExecute: (action: string) => void;
}

export const useInteractiveMenu = (
  element: MyElement
): UseInteractiveMenuResult => {
  const editor = useTEditorRef();
  const computer = useComputer();
  const [showInteractionMenu, setShowInteractionMenu] = useState(false);
  const interactions = useEditorUserInteractions('pasted-link');
  const interaction = useObservable(() => interactions);
  const selected = useSelected();
  const interactionsSource = useEditorUserInteractionsContext();
  const [lastInterestingUserInteraction, setLastInterestingUserInteraction] =
    useState<UserInteraction | undefined>();

  useEffect(() => {
    if (
      isInteractionOfType(interaction, 'pasted-link') &&
      selected &&
      !showInteractionMenu
    ) {
      // set interaction as consumed
      setLastInterestingUserInteraction(interaction);
      setShowInteractionMenu(true);
      interactionsSource.next({ type: 'consumed' });
    }
    if (showInteractionMenu && !selected) {
      setShowInteractionMenu(false);
    }
  }, [interaction, interactionsSource, selected, showInteractionMenu]);

  const cleanupAfterCommand = useCallback(
    (inter: UserInteraction | undefined) => {
      if (inter && inter.type === 'pasted-link') {
        const path = findNodePath(editor, element);
        if (path) {
          const entry = findNode(editor, {
            at: path,
            match: (node) =>
              isText(node) && getNodeString(node).includes(inter.url),
          });
          if (entry) {
            const [node, nodePath] = entry;
            const textAfterUrlRemoval = getNodeString(node).replace(
              inter.url,
              ''
            );
            if (textAfterUrlRemoval) {
              insertText(editor, textAfterUrlRemoval, { at: nodePath });
            } else {
              removeNodes(editor, { at: nodePath });
            }
          }
        }
      }
    },
    [editor, element]
  );

  const onInteractionMenuExecute = useCallback(
    (command: string) => {
      setShowInteractionMenu(false);
      switch (command) {
        case 'import': {
          if (
            isInteractionOfType(lastInterestingUserInteraction, 'pasted-link')
          ) {
            insertImport(
              editor,
              lastInterestingUserInteraction.source,
              lastInterestingUserInteraction.url
            );
            setLastInterestingUserInteraction(undefined);
          }
          break;
        }
        case 'connect': {
          if (
            isInteractionOfType(lastInterestingUserInteraction, 'pasted-link')
          ) {
            insertLiveConnection(
              editor,
              computer,
              lastInterestingUserInteraction.source,
              lastInterestingUserInteraction.url
            );
            setLastInterestingUserInteraction(undefined);
          }
        }
      }
      cleanupAfterCommand(lastInterestingUserInteraction);
    },
    [cleanupAfterCommand, computer, editor, lastInterestingUserInteraction]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showInteractionMenu && !event.shiftKey) {
        switch (event.key) {
          case 'Escape':
            setShowInteractionMenu(false);
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    },
    [showInteractionMenu]
  );
  useWindowListener('keydown', onKeyDown, true);

  return {
    showInteractionMenu,
    onInteractionMenuExecute,
    source:
      lastInterestingUserInteraction?.type === 'pasted-link'
        ? lastInterestingUserInteraction.source
        : undefined,
  };
};
