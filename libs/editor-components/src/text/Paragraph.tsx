import { getAnalytics } from '@decipad/client-events';
import {
  useEditorChange,
  useNodePath,
  useNodeText,
} from '@decipad/editor-hooks';
import type {
  MyEditor,
  AnyElement,
  ParagraphElement,
  PlateComponent,
} from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH, useMyEditorRef } from '@decipad/editor-types';
import { getRangeSafe } from '@decipad/editor-utils';
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
import { useTurnIntoProps } from '../utils';

const isSelected = (editor: MyEditor, element: AnyElement) => {
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
  const [showAiPanel, setShowAiPanel] = useState(false);
  const toggleAiPanel = () => {
    getAnalytics().then((analytics) =>
      analytics?.track('Opening paragraph AI panel')
    );
    setShowAiPanel((t) => !t);
  };

  return (
    <DraggableBlock
      blockKind="paragraph"
      element={element}
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
