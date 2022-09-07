import { useCallback, useEffect } from 'react';
import { useSelected } from 'slate-react';
import { InlineNumberElement, useTEditorRef } from '@decipad/editor-types';
import { useResult } from '@decipad/react-contexts';
import {
  isCollapsed,
  findNodePath,
  getNodeString,
  insertText,
  removeNodes,
  TReactEditor,
  useEditorRef,
} from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/editor-utils';

export const useDeleteEmptyInlineNumber = (bubble: InlineNumberElement) => {
  const editor = useEditorRef();
  const isSelected = useSelected();
  const isEmpty = getNodeString(bubble) === '';

  useEffect(() => {
    if (isSelected) return;
    if (!isEmpty) return;

    deleteInlineNumber(editor, bubble);
  }, [editor, bubble, isEmpty, isSelected]);
};

export const useInlineNumberSyntaxFixer = (bubble: InlineNumberElement) => {
  const isSelected = useSelected();
  const isResultValid = !useIsInvalid(bubble.id);

  const editor = useEditorRef();

  useEffect(() => {
    if (isSelected) return;
    if (isResultValid) return;

    cleanUpInlineNumberSyntax(editor, bubble);
  }, [editor, bubble, isSelected, isResultValid]);
};

const useIsInvalid = (bubbleId: string) => {
  const result = useResult(bubbleId);

  const hasSyntaxError = result?.type === 'computer-parse-error';
  const hasTypeError = result?.result?.type.kind === 'type-error';
  return hasTypeError || hasSyntaxError;
};

const deleteInlineNumber = (
  editor: TReactEditor,
  node: InlineNumberElement,
  nodePath = findNodePath(editor, node)
) => {
  if (nodePath == null)
    throw new Error('Cannot remove non-existent inline number');

  removeNodes(editor, { at: nodePath });
};

const cleanUpInlineNumberSyntax = (
  editor: TReactEditor,
  node: InlineNumberElement,
  nodePath = findNodePath(editor, node)
) => {
  const text = getNodeString(node);

  const value = parseFloat(text);
  const number = isFinite(value) ? value : 0;
  const expression = number.toString();

  if (nodePath == null)
    throw new Error('Cannot normalize non-existent inline number');

  insertText(editor, expression, { at: nodePath });
};

export const useEditInlineNumberName = (bubble: InlineNumberElement) => {
  const editor = useTEditorRef();
  const isSelected = useSelected();
  const isSelectionCollapsed = isCollapsed(editor.selection);

  const setNameEditing = useElementMutatorCallback(
    editor,
    bubble,
    'allowEditingName'
  );

  const isEditing = isSelected && isSelectionCollapsed;
  const shouldReset = bubble.allowEditingName && !isEditing;

  useEffect(() => {
    if (shouldReset) {
      setNameEditing(false);
    }
  }, [shouldReset, setNameEditing]);

  const allowNameEditing = useCallback(
    () => setNameEditing(true),
    [setNameEditing]
  );

  return { allowNameEditing, isEditing };
};
