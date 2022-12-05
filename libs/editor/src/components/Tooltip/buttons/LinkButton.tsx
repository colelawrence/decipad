import {
  focusEditor,
  getPluginType,
  someNode,
  triggerFloatingLink,
  unwrapLink,
} from '@udecode/plate';
import { ComponentProps, FC, MouseEvent, useCallback } from 'react';
import { ELEMENT_LINK, useTEditorRef } from '@decipad/editor-types';
import { FloatingButton, useEventNoEffect } from '@decipad/ui';

export const LinkButton = (
  props: ComponentProps<typeof FloatingButton>
): ReturnType<FC> => {
  const editor = useTEditorRef();

  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <FloatingButton
      isActive={isLink}
      onMouseDown={useCallback((event: MouseEvent) => {
        event.preventDefault();
      }, [])}
      onClick={useEventNoEffect(
        useCallback(() => {
          if (!editor) return;

          focusEditor(editor, editor.selection ?? editor.prevSelection!);

          setTimeout(() => {
            if (isLink) {
              unwrapLink(editor);
              return;
            }
            triggerFloatingLink(editor, { focused: true });
          }, 0);
        }, [editor, isLink])
      )}
      {...props}
    ></FloatingButton>
  );
};
