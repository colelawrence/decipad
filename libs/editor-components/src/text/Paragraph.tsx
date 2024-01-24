import {
  COLUMN_KINDS,
  MyEditor,
  MyElement,
  PlateComponent,
  useMyEditorRef,
} from '@decipad/editor-types';
import { getRangeSafe, isDragAndDropHorizontal } from '@decipad/editor-utils';
import {
  useEditorChange,
  useNodePath,
  useNodeText,
} from '@decipad/editor-hooks';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { Paragraph as UIParagraph, ParagraphPlaceholder } from '@decipad/ui';
import {
  findNodePath,
  insertText,
  isElementEmpty,
  isSelectionExpanded,
} from '@udecode/plate-common';
import { Range } from 'slate';
import { useState } from 'react';
import { ReactEditor } from 'slate-react';
import { getAnalytics } from '@decipad/client-events';
import { DraggableBlock } from '../block-management';
import { useDragAndDropGetAxis, useDragAndDropOnDrop } from '../hooks';
import { useTurnIntoProps } from '../utils';
import { ParagraphAIPanel } from '../AIPanel';

const analytics = getAnalytics();

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
  const paragraph = useNodeText(element);

  const readOnly = useIsEditorReadOnly();

  // Performance improvement as opposed to use something like `useTEditorState()`.
  // We couldn't use `useMyEditorRef()` because we need the paragraph to re-render
  // when the amount of editor children change.
  const showPlaceHolder = useEditorChange(
    (editor) =>
      (editor.children.length === 1 && isElementEmpty(editor, element)) ||
      (isElementEmpty(editor, element) &&
        isSelected(editor, element) &&
        !isSelectionExpanded(editor)),
    {
      debounceTimeMs: 0,
    }
  );

  const placeholder =
    readOnly || !showPlaceHolder ? undefined : <ParagraphPlaceholder />;

  const turnIntoProps = useTurnIntoProps(element);
  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const isHorizontal = isDragAndDropHorizontal(false, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });
  const [showAiPanel, setShowAiPanel] = useState(false);
  const toggleAiPanel = () => {
    if (analytics) {
      analytics.track('Opening paragraph AI panel');
    }
    setShowAiPanel((t) => !t);
  };

  return (
    <DraggableBlock
      blockKind="paragraph"
      element={element}
      accept={isHorizontal ? COLUMN_KINDS : undefined}
      getAxis={getAxis}
      onDrop={onDrop}
      aiPanel={{
        text: 'Rewrite with AI',
        visible: showAiPanel,
        toggle: toggleAiPanel,
      }}
      {...turnIntoProps}
      {...attributes}
    >
      <UIParagraph placeholder={placeholder}>{children}</UIParagraph>
      {showAiPanel && (
        <ParagraphAIPanel
          paragraph={paragraph || ''}
          toggle={toggleAiPanel}
          updateParagraph={(s) => {
            insertText(editor, s, { at: findNodePath(editor, element) });
            toggleAiPanel();
          }}
        />
      )}
    </DraggableBlock>
  );
};
