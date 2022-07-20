import {
  focusEditor,
  getPluginType,
  someNode,
  triggerFloatingLink,
  unwrapLink,
} from '@udecode/plate';
import { ComponentProps, FC } from 'react';
import { ELEMENT_LINK, useTEditorRef } from '@decipad/editor-types';
import { atoms } from '@decipad/ui';

export const LinkButton = (
  props: ComponentProps<typeof atoms.FloatingButton>
): ReturnType<FC> => {
  const editor = useTEditorRef();

  const type = getPluginType(editor, ELEMENT_LINK);
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return (
    <atoms.FloatingButton
      isActive={isLink}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        if (!editor) return;

        event.preventDefault();
        event.stopPropagation();

        focusEditor(editor, editor.selection ?? editor.prevSelection!);

        setTimeout(() => {
          if (isLink) {
            unwrapLink(editor);
            return;
          }
          triggerFloatingLink(editor, { focused: true });
        }, 0);
      }}
      {...props}
    ></atoms.FloatingButton>
  );
};
