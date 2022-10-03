import { MyEditor, MyElement, PlateComponent } from '@decipad/editor-types';
import {
  useEditorSelector,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { Paragraph as UIParagraph, ParagraphPlaceholder } from '@decipad/ui';
import { getRange, isElementEmpty, isSelectionExpanded } from '@udecode/plate';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { DraggableBlock } from '../block-management';

const isSelected = (editor: MyEditor, element: MyElement) =>
  !!(
    editor.selection &&
    Range.intersection(
      getRange(editor, ReactEditor.findPath(editor as ReactEditor, element)),
      editor.selection
    )
  );

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
  const showPlaceHolder = useEditorSelector(
    (editor) =>
      (editor.children.length === 2 && isElementEmpty(editor, element)) ||
      (isElementEmpty(editor, element) &&
        isSelected(editor, element) &&
        !isSelectionExpanded(editor))
  );

  const placeholder =
    readOnly || !showPlaceHolder ? undefined : <ParagraphPlaceholder />;

  return (
    <DraggableBlock blockKind="paragraph" element={element} {...attributes}>
      <UIParagraph placeholder={placeholder}>{children}</UIParagraph>
    </DraggableBlock>
  );
};
