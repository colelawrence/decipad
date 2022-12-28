import {
  ELEMENT_COLUMNS,
  InterceptableEvent,
  MyEditor,
  MyElement,
  MyElementEntry,
  MyPlatePlugin,
} from '@decipad/editor-types';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
  getNode,
  isCollapsed,
  isEditor,
  isElement,
} from '@udecode/plate';
import { BaseEditor, Editor, Location } from 'slate';
import { findClosestBlockOrColumn } from './findClosestBlockOrColumn';

const ALLOW_DELETE = new Set([ELEMENT_UL, ELEMENT_LI, ELEMENT_LIC, ELEMENT_OL]);

/**
 * Prevents default slate/browser weird behavior through allowing to intercept events.
 * Interceptor functions are registered with `createEventInterceptorPluginFactory`
 *
 * This plugin must be the first in the chain, because it has to be the first to see user events.
 */
export const createEventInterceptionSuperHandlerPlugin = (): MyPlatePlugin => {
  return {
    key: 'EVENT_INTERCEPTION_PLUGIN',
    handlers: {
      onKeyDownCapture: (editor) => (event) => {
        const cursorPath =
          editor.selection &&
          isCollapsed(editor.selection) &&
          editor.selection.focus.path;

        const leafNodeInCollapsedSelection = () => {
          const node = cursorPath && getNode(editor, cursorPath);
          return (
            node &&
            !isEditor(node) &&
            !isElement(node) &&
            'text' in node &&
            node
          );
        };

        const topLevel =
          cursorPath && findClosestBlockOrColumn(editor, cursorPath);

        if (topLevel) {
          const prevBlock = Editor.previous(editor as BaseEditor, {
            at: topLevel[1],
          });
          const nextBlock = Editor.next(editor as BaseEditor, {
            at: topLevel[1],
          });

          switch (event.key) {
            case 'Backspace': {
              // Handle problematic delete (at start of text node)

              // Some nodes are ok to delete
              const node = getNode(editor, [cursorPath[0]]);

              if (
                leafNodeInCollapsedSelection() &&
                editor.selection?.focus.offset === 0 &&
                !ALLOW_DELETE.has((node as MyElement).type)
              ) {
                const wasHandled = bubbleCancelableEvent(
                  editor,
                  { type: 'delete-text-start', event },
                  cursorPath
                );
                if (!wasHandled && prevBlock != null) {
                  // Didn't handle it locally!
                  // What does the block *before* me think about this?
                  bubbleCancelableEvent(
                    editor,
                    { type: 'delete-block', event },
                    prevBlock[1]
                  );
                }
              }
              // TODO handle problematic delete of whole selection
              return;
            }

            case 'Delete': {
              // Handle problematic delete (at end of text node)

              const leafNode = leafNodeInCollapsedSelection();
              const cursorAtEnd =
                leafNode &&
                editor.selection?.focus.offset === leafNode.text.length;

              if (cursorAtEnd) {
                const wasHandled = bubbleCancelableEvent(
                  editor,
                  { type: 'delete-text-end', event },
                  cursorPath
                );

                if (!wasHandled && nextBlock != null) {
                  // Didn't handle it locally!
                  // What does the block *after* me think about this?

                  bubbleCancelableEvent(
                    editor,
                    { type: 'delete-block', event },
                    nextBlock[1]
                  );
                }
              }

              // TODO handle problematic delete of whole selection
            }
          }
        }
      },
    },
  };
};

/** goes through event target, parent, grandparent, etc, looking for interceptors */
function bubbleCancelableEvent(
  editor: MyEditor,
  interceptableEvent: InterceptableEvent,
  bubbleAt?: Location
): boolean {
  const elementsBubblePath = [
    ...Editor.levels(editor as BaseEditor, {
      match: isElement,
      reverse: true,
      at: bubbleAt,
    }),
  ] as MyElementEntry[];

  const cancel = () => {
    interceptableEvent.event.preventDefault();
    interceptableEvent.event.stopPropagation();
  };

  for (const entry of elementsBubblePath) {
    if (entry[0].type === ELEMENT_COLUMNS) {
      return true;
    }

    const wasHandled = editor.interceptEvent?.(
      editor,
      entry,
      interceptableEvent
    );

    if (wasHandled === true) {
      cancel();
      return true;
    }
  }

  return false;
}
