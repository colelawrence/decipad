import { useCallback } from 'react';
import { organisms } from '@decipad/ui';
import {
  PlateComponent,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CODE_LINE,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { ReactEditor } from 'slate-react';
import { serializeHtml, usePlateEditorRef } from '@udecode/plate';
import copy from 'copy-to-clipboard';
import { Node, Transforms } from 'slate';
import { insertNodeIntoColumns } from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  if (element?.type !== ELEMENT_VARIABLE_DEF) {
    throw new Error(`VariableDef is meant to render variable def elements`);
  }

  const editor = usePlateEditorRef();
  const onConvert = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.delete(editor, { at: path });
    Transforms.insertNodes(
      editor,
      {
        id: element.id,
        type: ELEMENT_CODE_LINE,
        children: [
          {
            text: `${Node.string(element.children[0])} = ${Node.string(
              element.children[1]
            )}`,
          },
        ],
      } as Node,
      { at: path }
    );
  }, [editor, element]);

  const onDelete = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.delete(editor, { at: path });
  }, [editor, element]);

  const onCopy = useCallback(() => {
    copy(serializeHtml(editor, { nodes: [element] }), {
      format: 'text/html',
    });
  }, [editor, element]);

  const onAdd = useCallback(() => {
    const at = ReactEditor.findPath(editor, element);
    insertNodeIntoColumns(
      editor,
      {
        type: ELEMENT_VARIABLE_DEF,
        children: [
          {
            type: ELEMENT_CAPTION,
            children: [{ text: '' }],
          },
          {
            type: ELEMENT_EXPRESSION,
            children: [{ text: '' }],
          },
        ],
      },
      at
    );
  }, [editor, element]);

  return (
    <div {...attributes}>
      <DraggableBlock blockKind="interactive" element={element}>
        <organisms.VariableEditor
          onConvert={onConvert}
          onDelete={onDelete}
          onCopy={onCopy}
          onAdd={onAdd}
        >
          {children}
        </organisms.VariableEditor>
      </DraggableBlock>
    </div>
  );
};
