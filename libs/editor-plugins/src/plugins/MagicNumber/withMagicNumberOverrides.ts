/* eslint-disable no-param-reassign */
import { getPointAfter, getPointBefore, isCollapsed } from '@udecode/plate';
import { MyWithOverride } from '@decipad/editor-types';
import { removeMagicNumberInput } from './transforms';
import { findMagicNumberInput } from './queries';

export const withMagicNumberOverrides: MyWithOverride = (editor) => {
  const { deleteBackward, deleteForward } = editor;

  editor.deleteBackward = (unit) => {
    if (editor.selection && isCollapsed(editor.selection)) {
      const before = getPointBefore(editor, editor.selection?.focus);
      const currentMentionInput = findMagicNumberInput(editor, { at: before });
      if (currentMentionInput) {
        removeMagicNumberInput(editor, currentMentionInput[1]);
        return;
      }
    }
    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (editor.selection && isCollapsed(editor.selection)) {
      const after = getPointAfter(editor, editor.selection?.focus);
      const currentMentionInput = findMagicNumberInput(editor, { at: after });
      if (currentMentionInput) {
        removeMagicNumberInput(editor, currentMentionInput[1]);
        return;
      }
    }
    deleteForward(unit);
  };

  return editor;
};
