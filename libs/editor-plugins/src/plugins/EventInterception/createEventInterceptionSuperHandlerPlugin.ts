import {
  ELEMENT_COLUMNS,
  ELEMENT_LIC,
  InterceptableEvent,
  MyEditor,
  MyElementEntry,
  MyPlatePlugin,
} from '@decipad/editor-types';
import {
  getLevels,
  getNextNode,
  getNodeParent,
  getPreviousNode,
  isCollapsed,
  isElement,
} from '@udecode/plate';
import { Location } from 'slate';
import { findClosestBlockOrColumn } from './findClosestBlockOrColumn';
import { isCursorAtBlockEdge } from './isCursorAtBlockEdge';

/**
 * Prevents default slate/browser weird behavior through allowing to intercept events.
 * Interceptor functions are registered with `createEventInterceptorPluginFactory`
 *
 * Currently the interceptor by default cancels: Backspace, Delete and Enter.
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

        const topLevel =
          cursorPath && findClosestBlockOrColumn(editor, cursorPath);
        if (!cursorPath) {
          return;
        }
        const parentNode = getNodeParent(editor, cursorPath);

        if (topLevel) {
          const prevBlock = getPreviousNode(editor, {
            at: topLevel[1],
          });
          const nextBlock = getNextNode(editor, {
            at: topLevel[1],
          });

          // Input elements are used in elements such as:
          // Slider (Max and min), and dropdown.
          // Preventing backspace and other events in them causes
          // strange behavior.
          // Also preventing backspace for lists can also lead to a weird behavior
          if (
            document.activeElement?.tagName === 'INPUT' ||
            document.activeElement?.tagName === 'TEXTAREA' ||
            parentNode.type === ELEMENT_LIC
          )
            return;
          switch (event.key) {
            case 'Backspace': {
              // Handle problematic delete (at start of text node)
              if (isCursorAtBlockEdge(editor, 'start')) {
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

              if (isCursorAtBlockEdge(editor, 'end')) {
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
              return;
            }
            case 'Enter': {
              // Let the interceptor for this event handle the enter press
              bubbleCancelableEvent(
                editor,
                { type: 'on-enter', event },
                cursorPath
              );
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
    ...getLevels(editor, {
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
