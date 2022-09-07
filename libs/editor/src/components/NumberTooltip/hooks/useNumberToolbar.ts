import { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getNodeString, mergeProps, useEditorState } from '@udecode/plate-core';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  flip,
  getSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
  UseVirtualFloatingOptions,
  UseVirtualFloatingReturn,
} from '@udecode/plate-floating';
import { getSelectionBubble } from '@decipad/editor-utils';
import { isSelectionExpanded } from '@udecode/plate';
import { InlineNumberElement } from '@decipad/editor-types';

export const useNumberToolbar = ({
  floatingOptions,
}: {
  floatingOptions?: UseVirtualFloatingOptions;
} = {}): UseVirtualFloatingReturn & {
  open: boolean;
  bubble: InlineNumberElement | null;
} => {
  const editor = useEditorState();
  const [open, setOpen] = useState(true);

  const bubbleElement = getSelectionBubble(editor as any);
  const containsBubbles = bubbleElement != null;
  const selectionCollapsed = !isSelectionExpanded(editor);

  const floatingResult = useVirtualFloating(
    mergeProps(
      {
        middleware: [
          offset(12),
          flip({
            padding: 96,
          }),
        ],
        placement: 'top',
        getBoundingClientRect: getSelectionBoundingClientRect,
        open,
        onOpenChange: setOpen,
      },
      floatingOptions
    )
  );

  const { update } = floatingResult;
  const { selection } = editor;

  const formula = bubbleElement ? getNodeString(bubbleElement) : '';
  const isFormulaEmpty = formula.trim() === '';
  const isOpened =
    selectionCollapsed &&
    containsBubbles &&
    !isFormulaEmpty &&
    !!bubbleElement.allowEditingName;

  useEffect(() => {
    if (isOpened) update();
  }, [selection, isOpened, update]);

  useEffect(() => setOpen(isOpened), [isOpened]);

  return { ...floatingResult, open, bubble: bubbleElement };
};
