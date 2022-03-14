import { ELEMENT_LIC, ELEMENT_UL } from '@decipad/editor-types';
import {
  getParent,
  isCollapsed,
  toggleList,
  toggleNodeType,
  useStoreEditorState,
} from '@udecode/plate';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { allowsTextStyling } from '../../../utils/block';
import { getPathContainingSelection } from '../../../utils/selection';

interface UseEditorTooltip {
  ref: RefObject<HTMLDivElement>;
  active: boolean;
  currentBlockType: null | string;
  toggleElementType: (type: string) => void;
}

export const useEditorTooltip = (): UseEditorTooltip => {
  const editor = useStoreEditorState();
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentBlockType, setCurrentBlockType] = useState<null | string>(null);

  // As long as we only ever `setIsActive(true)` we don't cause infinite update loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current;

    if (editor) {
      const { selection } = editor;

      if (
        selection &&
        ReactEditor.isFocused(editor) &&
        !isCollapsed(selection) &&
        Editor.string(editor, selection) !== '' &&
        allowsTextStyling(editor, getPathContainingSelection(editor))
      ) {
        const parentEntry = getParent(editor, selection);

        if (parentEntry) {
          const [node] = parentEntry;

          setCurrentBlockType(node.type);
        }

        const domSelection = window.getSelection();
        const domRange = domSelection?.getRangeAt(0);
        const rect = domRange?.getBoundingClientRect();

        setIsActive(true);

        if (el && rect) {
          el.style.opacity = '1';
          el.style.top = `${
            rect.top + window.scrollY - el.offsetHeight - 10
          }px`;
          el.style.left = `${
            rect.left + window.scrollX - el.offsetWidth / 2 + rect.width / 2
          }px`;
        }
      }
    }

    return () => {
      if (el) {
        el.removeAttribute('style');
      }
      setIsActive(false);
    };
  });

  const toggleElementType = useCallback(
    (type: string) => {
      if (editor && editor.selection) {
        const { selection } = editor;
        if (type === ELEMENT_UL) {
          toggleList(editor, { type });
          editor.selection = null;
          setIsActive(false);
        }
        const parentEntry = getParent(editor, selection);
        if (parentEntry) {
          const [node] = parentEntry;

          if (Element.isElement(node) && node.type === ELEMENT_LIC) {
            toggleList(editor, { type: ELEMENT_UL });
          }
        }
        toggleNodeType(editor, { activeType: type });
        editor.selection = null;
        setIsActive(false);
      }
    },
    [editor]
  );

  return {
    ref,
    active: isActive,
    currentBlockType,
    toggleElementType,
  };
};
