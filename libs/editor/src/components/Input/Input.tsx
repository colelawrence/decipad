import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_INPUT,
  InputElement,
  PlateComponent,
} from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import {
  ExpressionEditor,
  LeaveDirection,
} from '@decipad/editor-expression-editor';
import { ClientEventsContext } from '@decipad/client-events';
import { FC, useCallback, useContext, useState } from 'react';
import { BasePoint, Editor, Transforms } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { useEditorRef } from '@udecode/plate';
import { useElementMutatorCallback } from '@decipad/slate-react-utils';
import { insertNodeIntoColumns } from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';
import { useComputer } from '@decipad/react-contexts';

export const Input: PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  const editor = useEditorRef();
  const isReadOnly = useReadOnly();
  const computer = useComputer();
  const clientEvent = useContext(ClientEventsContext);
  const [focus, setFocus] = useState(false);

  if (element?.type !== ELEMENT_INPUT) {
    throw new Error('Input is meant to render input elements');
  }

  const onFocus = useCallback(() => {
    const currentPath = ReactEditor.findPath(editor, element);
    if (currentPath) {
      Transforms.setSelection(editor, {
        anchor: { path: [...currentPath, 0], offset: 0 },
      });
    }
    setFocus(true);
  }, [editor, element]);

  const onChangeVariableName = useElementMutatorCallback<InputElement>(
    editor,
    element,
    'variableName'
  );
  const onChangeValue = useElementMutatorCallback<InputElement>(
    editor,
    element,
    'value'
  );

  const onChangeValueWithEvent = useCallback(
    (value: string) => {
      onChangeValue(value);
      clientEvent({
        type: 'action',
        action: 'number field updated',
        props: { isReadOnly },
      });
    },
    [onChangeValue, clientEvent, isReadOnly]
  );

  const onConvert = useCallback(() => {
    const at = ReactEditor.findPath(editor, element);
    Editor.withoutNormalizing(editor, () => {
      Transforms.setNodes(
        editor,
        {
          type: ELEMENT_CODE_LINE,
          variableName: undefined,
          value: undefined,
        } as Partial<CodeLineElement>,

        { at }
      );
      Transforms.insertText(
        editor,
        `${element.variableName} = ${element.value}`,
        { at }
      );
      Transforms.wrapNodes(
        editor,
        { type: ELEMENT_CODE_BLOCK, children: [] } as Omit<
          CodeBlockElement,
          'id'
        >,
        { at }
      );
    });
  }, [editor, element]);

  const onLeave = useCallback(
    (direction: LeaveDirection) => {
      const currentSelection = editor.selection;
      if (currentSelection) {
        const currentPath = ReactEditor.findPath(editor, element);
        if (currentPath && currentPath.length) {
          const rootElementPath = [currentPath[0]];
          const nextAnchor: BasePoint | undefined =
            direction === 'down' || direction === 'right'
              ? Editor.after(editor, rootElementPath)
              : Editor.before(editor, rootElementPath);

          if (!nextAnchor) {
            return;
          }
          const nextPoint = Editor.end(editor, nextAnchor);
          if (nextPoint && Editor.hasPath(editor, nextPoint.path)) {
            Transforms.setSelection(editor, {
              anchor: nextPoint,
              focus: nextPoint,
            });
            setTimeout(() => ReactEditor.focus(editor), 0);
          }
        }
      }
      setFocus(false);
    },
    [editor, element]
  );

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <div {...attributes} contentEditable={false}>
      {children}
      <DraggableBlock blockKind="interactive" element={element}>
        <organisms.EditorInteractiveInput
          name={element.variableName}
          onAdd={() => {
            const at = ReactEditor.findPath(editor, element);
            insertNodeIntoColumns(
              editor,
              {
                type: ELEMENT_INPUT,
                children: [{ text: '' }],
              },
              at
            );
          }}
          onChangeName={onChangeVariableName}
          onChangeValue={onChangeValueWithEvent}
          onConvert={onConvert}
          onCopy={() => {
            // TODO
          }}
          onDelete={() => {
            Transforms.delete(editor, {
              at: ReactEditor.findPath(editor, element),
            });
          }}
          readOnly={isReadOnly}
          value={element.value}
        >
          <ExpressionEditor
            value={element.value}
            computer={computer}
            focus={focus}
            onFocus={onFocus}
            onChange={onChangeValueWithEvent}
            onLeave={onLeave}
          />
        </organisms.EditorInteractiveInput>
      </DraggableBlock>
    </div>
  );
};
