import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { Portal } from 'react-portal';
import { Editor, Range } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { FormatButton } from './FormatButton.component';
import { ToolbarOptions } from './options';

export const HoveringToolbar = (): JSX.Element => {
  const editor = useSlate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    const isInCompatibleBlocks = (): boolean | undefined => {
      if (selection) {
        const [parentNode] = Editor.parent(editor, selection);
        return !['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          parentNode.type as string
        );
      }
      return;
    };

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor as any) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === '' ||
      isInCompatibleBlocks()
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = (domSelection as Selection).getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = '1';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  return (
    <Portal>
      <Box
        ref={ref}
        pos="absolute"
        zIndex="999"
        top="-10000px"
        left="-10000px"
        mt="-6px"
        opacity="0"
        bg="gray.700"
        borderRadius="4px"
        transition="opacity 0.75s"
      >
        {ToolbarOptions.map((option, index) => (
          <FormatButton key={index} {...option} />
        ))}
      </Box>
    </Portal>
  );
};
