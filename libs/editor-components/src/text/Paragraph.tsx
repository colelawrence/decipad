import { MyEditor, MyElement, PlateComponent } from '@decipad/editor-types';
import { getRangeSafe } from '@decipad/editor-utils';
import {
  useEditorChangeState,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { Paragraph as UIParagraph, ParagraphPlaceholder } from '@decipad/ui';
import { isElementEmpty, isSelectionExpanded } from '@udecode/plate';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { DraggableBlock } from '../block-management';

const isSelected = (editor: MyEditor, element: MyElement) => {
  if (!editor.selection) {
    return false;
  }
  const path = ReactEditor.findPath(editor as ReactEditor, element);
  if (!path) {
    return false;
  }
  const range = getRangeSafe(editor, path);
  return !!(range && Range.intersection(range, editor.selection));
};

export const Paragraph: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (!element) {
    throw new Error('Paragraph is not a leaf');
  }

  const readOnly = useIsEditorReadOnly();

  // Performance improvement as opposed to use something like `useTEditorState()`.
  // We couldn't use `useTEditorRef()` because we need the paragraph to re-render
  // when the amount of editor children change.
  const showPlaceHolder = useEditorChangeState(
    (editor) =>
      (editor.children.length === 2 && isElementEmpty(editor, element)) ||
      (isElementEmpty(editor, element) &&
        isSelected(editor, element) &&
        !isSelectionExpanded(editor)),
    false,
    {
      debounceTimeMs: 0,
    }
  );

  const placeholder =
    readOnly || !showPlaceHolder ? undefined : <ParagraphPlaceholder />;

  return (
    <DraggableBlock blockKind="paragraph" element={element} {...attributes}>
      <UIParagraph placeholder={placeholder}>{children}</UIParagraph>
    </DraggableBlock>
  );
};
