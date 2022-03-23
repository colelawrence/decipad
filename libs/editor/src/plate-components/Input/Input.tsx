import { types } from '@decipad/editor-config';
import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_INPUT,
  InputElement,
} from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { useEditorState } from '@udecode/plate';
import { ClientEventsContext } from '@decipad/client-events';
import { FC, useCallback, useContext } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { useElementMutatorCallback } from '../../utils/slateReact';
import { insertNodeIntoColumns } from '../../utils/layout';
import { DraggableBlock } from '../../components';

export const Input: types.PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  const editor = useEditorState();
  const isReadOnly = useReadOnly();
  const clientEvent = useContext(ClientEventsContext);

  if (element?.type !== ELEMENT_INPUT) {
    throw new Error('Input is meant to render input elements');
  }

  const onChangeVariableName = useElementMutatorCallback<InputElement>(
    editor,
    element,
    'variableName'
  );
  const onChangeValue = useElementMutatorCallback<InputElement>(
    editor,
    element,
    'value',
    () =>
      clientEvent({
        type: 'action',
        action: 'number field updated',
        props: { isReadOnly },
      })
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
          onChangeValue={onChangeValue}
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
        />
      </DraggableBlock>
    </div>
  );
};
