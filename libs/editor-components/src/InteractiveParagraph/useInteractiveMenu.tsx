import {
  ImportElementSource,
  MyElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  EditorPasteInteractionMenuContextValue,
  useComputer,
  useEditorPasteInteractionMenuContext,
} from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { useToast } from '@decipad/toast';
import {
  findNode,
  findNodePath,
  getNodeString,
  insertText,
  isText,
  removeNodes,
} from '@udecode/plate';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelected } from 'slate-react';
import { insertImport } from './insertImport';
import { insertLiveConnection } from './insertLiveConnection';

interface UseInteractiveMenuResult {
  showInteractionMenu: boolean;
  source?: ImportElementSource;
  onInteractionMenuExecute: (action: string) => void;
  blockId: string;
}

export const useInteractiveMenu = (
  element: MyElement
): UseInteractiveMenuResult => {
  const editor = useTEditorRef();
  const pasteContext = useEditorPasteInteractionMenuContext(element.id);
  const session = useSession();
  const [show, setShow] = useState(false);
  const lastConsumedPasteContext =
    useRef<EditorPasteInteractionMenuContextValue>();
  const selected = useSelected();

  useEffect(() => {
    if (
      lastConsumedPasteContext.current !== pasteContext &&
      pasteContext.showInteractionMenu &&
      selected &&
      !show
    ) {
      lastConsumedPasteContext.current = pasteContext;
      setShow(true);
    }
    if (!selected && show) {
      setShow(false);
    }
  }, [show, pasteContext, selected]);

  const cleanupAfterCommand = useCallback(
    (text: string) => {
      const path = findNodePath(editor, element);
      if (path) {
        const entry = findNode(editor, {
          at: path,
          match: (node) => isText(node) && getNodeString(node).includes(text),
        });
        if (entry) {
          const [node, nodePath] = entry;
          const textAfterUrlRemoval = getNodeString(node).replace(text, '');
          if (textAfterUrlRemoval) {
            insertText(editor, textAfterUrlRemoval, { at: nodePath });
          } else {
            removeNodes(editor, { at: nodePath });
          }
        }
      }
    },
    [editor, element]
  );

  const computer = useComputer();

  const toast = useToast();

  const onInteractionMenuExecute = useCallback(
    async (command: string) => {
      setShow(false);
      switch (command) {
        case 'import-all':
        case 'import-islands': {
          if (session.status === 'authenticated' && session.data.user?.id) {
            await insertImport({
              computer,
              editor,
              source: pasteContext.source,
              url: pasteContext.url,
              identifyIslands: command === 'import-islands',
              createdByUserId: session.data.user.id,
            });
          }
          break;
        }
        case 'connect-all':
        case 'connect-islands': {
          try {
            await insertLiveConnection({
              computer,
              editor,
              source: pasteContext.source,
              url: pasteContext.url,
              identifyIslands: command === 'connect-islands',
            });
          } catch (err) {
            toast((err as Error).message, 'error');
          }
        }
      }
      if (pasteContext.url) {
        cleanupAfterCommand(pasteContext.url);
      }
    },
    [
      cleanupAfterCommand,
      computer,
      editor,
      pasteContext,
      session.data?.user?.id,
      session.status,
      toast,
    ]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (pasteContext.showInteractionMenu && !event.shiftKey) {
        switch (event.key) {
          case 'Escape':
            setShow(false);
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    },
    [pasteContext]
  );
  useWindowListener('keydown', onKeyDown, true);

  return {
    blockId: element.id,
    showInteractionMenu: show,
    onInteractionMenuExecute,
    source: pasteContext.source,
  };
};
