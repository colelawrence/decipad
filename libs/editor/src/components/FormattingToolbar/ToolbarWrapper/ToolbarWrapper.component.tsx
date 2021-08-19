import styled from '@emotion/styled';
import {
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  isCollapsed,
  PortalBody,
  useStoreEditorState,
} from '@udecode/plate';
import { FC, useEffect, useRef, useState } from 'react';
import { Editor, Path } from 'slate';
import { ReactEditor } from 'slate-react';

const Wrapper = styled('div')({
  background: 'white',
  boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
  borderRadius: '6px',
  border: '1px solid #f0f0f2',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  opacity: 0,
  transition: 'opacity 0.2s ease-out',
});

export const ToolbarWrapper: FC = ({ children }) => {
  const editor = useStoreEditorState();
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const el = ref.current!;
    if (editor) {
      const { selection } = editor;

      const whiteList = [ELEMENT_PARAGRAPH, ELEMENT_H2, ELEMENT_H3];

      const isInCompatibleBlocks = (): boolean => {
        if (selection) {
          const [node] = Editor.node(
            editor,
            Path.parent(selection.anchor.path)
          );
          // TODO fix node typing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return whiteList.includes((node as any).type);
        }
        return false;
      };

      if (
        selection &&
        ReactEditor.isFocused(editor) &&
        !isCollapsed(selection) &&
        Editor.string(editor, selection) !== '' &&
        isInCompatibleBlocks()
      ) {
        // must be present when `selection` is
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const domSelection = window.getSelection()!;
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        setIsActive(true);
        if (el) {
          el.style.opacity = '1';
          el.style.top = `${rect.top + window.scrollY - el.offsetHeight}px`;
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

  if (!isActive) return null;

  return (
    <PortalBody>
      <Wrapper ref={ref}>{children}</Wrapper>
    </PortalBody>
  );
};
