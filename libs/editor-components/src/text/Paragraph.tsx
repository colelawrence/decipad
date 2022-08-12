import { MyEditor, MyElement, PlateComponent } from '@decipad/editor-types';
import { useEditorChange, useIsEditorReadOnly } from '@decipad/react-contexts';
import { atoms } from '@decipad/ui';
import { getRange, isElementEmpty, isSelectionExpanded } from '@udecode/plate';
import { useState } from 'react';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { DraggableBlock } from '../block-management';

const PLACEHOLDER_TEXT = 'Type “/” for commands or write text';

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
  const [showPlaceHolder, setShowPlaceholder] = useState(false);
  useEditorChange(
    (value: boolean) => setShowPlaceholder(value),
    (editor) =>
      (editor.children.length === 2 && isElementEmpty(editor, element)) ||
      (isElementEmpty(editor, element) &&
        isSelected(editor, element) &&
        !isSelectionExpanded(editor)),
    { debounceTimeMs: 0 }
  );

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="paragraph" element={element}>
        <atoms.Paragraph
          placeholder={
            !readOnly && showPlaceHolder ? PLACEHOLDER_TEXT : undefined
          }
        >
          {children}
        </atoms.Paragraph>
      </DraggableBlock>
    </div>
  );
};
