/* eslint-disable no-param-reassign */
import { WithOverride, isCollapsed } from '@udecode/plate';
import { Editor } from 'slate';
import { removeMagicNumberInput } from './transforms';
import { findMagicNumberInput } from './queries';

export const withMagicNumberOverrides: WithOverride = (editor) => {
  const { deleteBackward, deleteForward } = editor;

  editor.deleteBackward = (unit) => {
    if (editor.selection && isCollapsed(editor.selection)) {
      const before = Editor.before(editor, editor.selection?.focus);
      const currentMentionInput = findMagicNumberInput(editor, { at: before });
      if (currentMentionInput) {
        return removeMagicNumberInput(editor, currentMentionInput[1]);
      }
    }
    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (editor.selection && isCollapsed(editor.selection)) {
      const after = Editor.after(editor, editor.selection?.focus);
      const currentMentionInput = findMagicNumberInput(editor, { at: after });
      if (currentMentionInput) {
        return removeMagicNumberInput(editor, currentMentionInput[1]);
      }
    }
    deleteForward(unit);
  };

  return editor;
};
