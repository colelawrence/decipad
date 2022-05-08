import { ELEMENT_LIC, ELEMENT_UL } from '@decipad/editor-types';
import {
  allowsTextStyling,
  getPathContainingSelection,
  useSelection,
} from '@decipad/editor-utils';
import {
  getParent,
  isCollapsed,
  toggleList,
  toggleNodeType,
  usePlateEditorState,
} from '@udecode/plate';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Editor, Element } from 'slate';
import { ReactEditor } from 'slate-react';

interface UseEditorTooltip {
  ref: RefObject<HTMLDivElement>;
  active: boolean;
  currentBlockType: null | string;
  toggleElementType: (type: string) => void;
}

export const useEditorTooltip = (): UseEditorTooltip => {
  const editor = usePlateEditorState();
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentBlockType, setCurrentBlockType] = useState<null | string>(null);
  const selection = useSelection();

  // As long as we only ever `setIsActive(true)` we don't cause infinite update loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ref.current;

    if (editor) {
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

        if (!isActive) {
          setIsActive(true);
        }

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
      if (isActive) {
        setIsActive(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isActive, selection, ref.current]);

  const toggleElementType = useCallback(
    (type: string) => {
      if (editor && selection) {
        if (type === ELEMENT_UL) {
          toggleList(editor, { type });
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
        setIsActive(false);
      }
    },
    [editor, selection]
  );

  return {
    ref,
    active: isActive,
    currentBlockType,
    toggleElementType,
  };
};
