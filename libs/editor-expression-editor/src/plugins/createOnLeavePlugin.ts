import { ELEMENT_CODE_LINE, ELEMENT_INPUT } from '@decipad/editor-types';
import {
  getAbove,
  KeyboardHandler,
  PlatePlugin,
  TEditor,
} from '@udecode/plate';

export type LeaveDirection = 'up' | 'down' | 'left' | 'right';

export type OnLeaveCallback = (direction: LeaveDirection) => void;

const onKeyDown =
  (onLeave: OnLeaveCallback): KeyboardHandler =>
  (editor: TEditor) =>
  (event) => {
    const entry = getAbove(editor);
    if (!entry) {
      return;
    }
    const [node] = entry;
    if (node.type === ELEMENT_CODE_LINE) {
      const direction =
        event.code === 'Enter' || event.key === 'ArrowDown'
          ? 'down'
          : event.key === 'ArrowUp'
          ? 'up'
          : undefined;
      if (direction) {
        event.stopPropagation();
        event.preventDefault();
        onLeave(direction);
        return true;
      }
    }

    return false;
  };

export const createOnLeavePlugin = (onLeave: OnLeaveCallback): PlatePlugin => ({
  key: 'ON_LEAVE_EXPRESSION_EDITOR_PLUGIN',
  type: ELEMENT_INPUT,
  handlers: {
    onKeyDown: onKeyDown(onLeave),
  },
});
