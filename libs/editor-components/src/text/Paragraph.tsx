import { getAnalytics } from '@decipad/client-events';
import {
  useEditorChange,
  useNodePath,
  useNodeText,
} from '@decipad/editor-hooks';
import type {
  MyEditor,
  MyElement,
  ParagraphElement,
  PlateComponent,
} from '@decipad/editor-types';
import {
  COLUMN_KINDS,
  ELEMENT_PARAGRAPH,
  useMyEditorRef,
} from '@decipad/editor-types';
import { getRangeSafe, isDragAndDropHorizontal } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { ParagraphPlaceholder, Paragraph as UIParagraph } from '@decipad/ui';
import {
  findNodePath,
  insertNodes,
  insertText,
  isElementEmpty,
  isSelectionExpanded,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { ParagraphAIPanel } from '../AIPanel';
import { DraggableBlock } from '../block-management';
import { useDragAndDropGetAxis, useDragAndDropOnDrop } from '../hooks';
import { useTurnIntoProps } from '../utils';

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
    getAnalytics().then(({ track }) => track('Opening paragraph AI panel'));
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
          updateParagraph={(s, op = 'replace') => {
            if (op === 'replace') {
              insertText(editor, s, { at: findNodePath(editor, element) });
            } else {
              insertNodes(
                editor,
                [
                  {
                    type: ELEMENT_PARAGRAPH,
                    id: nanoid(),
                    children: [{ text: s }],
                  } satisfies ParagraphElement,
                ],
                {
                  at: [(path?.[0] ?? 0) + 1],
                }
              );
            }

            toggleAiPanel();
          }}
        />
      )}
    </DraggableBlock>
  );
};
