import {
  ELEMENT_PARAGRAPH,
  getParent,
  getPlatePluginOptions,
  isElement,
  KeyboardHandler,
  SPEditor,
  toggleMark,
} from '@udecode/plate';
import isHotkey from 'is-hotkey';

export const getToggleMarkOnKeyDown =
  <T extends SPEditor = SPEditor>(pluginKey: string): KeyboardHandler<T> =>
  (editor) =>
  (event) => {
    const { hotkey, type, clear } = getPlatePluginOptions(editor, pluginKey);
    const { selection } = editor;

    if (!hotkey) return;

    if (selection && isHotkey(hotkey, event as unknown as KeyboardEvent)) {
      event.preventDefault();

      const parentNode = getParent(editor, selection);

      if (!parentNode) return;

      const [node] = parentNode;

      if (isElement(node) && ![ELEMENT_PARAGRAPH].includes(node.type)) return;
      toggleMark(editor, type, clear);
    }
  };
