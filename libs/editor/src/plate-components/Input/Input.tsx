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
import { FC, useCallback } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { useElementMutatorCallback } from '../../utils/slateReact';

export const Input: types.PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  const editor = useEditorState();
  const isReadOnly = useReadOnly();

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
    'value'
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
      <organisms.EditorInteractiveInput
        name={element.variableName}
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
    </div>
  );
};
