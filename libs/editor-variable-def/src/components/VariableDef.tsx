import { useCallback, useState } from 'react';
import { organisms } from '@decipad/ui';
import {
  PlateComponent,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CODE_LINE,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { ReactEditor, useSlate } from 'slate-react';
import { PlateEditor, serializeHtml } from '@udecode/plate';
import copy from 'copy-to-clipboard';
import { Node, Transforms } from 'slate';
import {
  findPath,
  insertNodeIntoColumns,
  safeDelete,
} from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { AvailableSwatchColor } from 'libs/ui/src/utils';
import { getValueAsTextFromElement } from '../utils/getValueAsTextFromElement';

export const VariableDef: PlateComponent = ({
  attributes,
  element,
  children,
}) => {
  const [deleted, setDeleted] = useState(false);
  if (element?.type !== ELEMENT_VARIABLE_DEF) {
    throw new Error(`VariableDef is meant to render variable def elements`);
  }

  const editor = useSlate();
  const readOnly = useIsEditorReadOnly();
  const onConvert = useCallback(() => {
    const path = findPath(editor as ReactEditor, element);
    if (path) {
      Transforms.delete(editor, { at: path });
      const varName = Node.string(element.children[0]);
      const expression = getValueAsTextFromElement(element);
      Transforms.insertNodes(
        editor,
        {
          id: element.id,
          type: ELEMENT_CODE_LINE,
          children: [
            {
              text: `${varName} = ${expression}`,
            },
          ],
        } as Node,
        { at: path }
      );
    }
  }, [editor, element]);

  const onDelete = useCallback(() => {
    const path = findPath(editor as ReactEditor, element);
    if (path) {
      setDeleted(true);
      safeDelete(editor, path);
    }
  }, [editor, element]);

  const onCopy = useCallback(() => {
    copy(serializeHtml(editor as PlateEditor, { nodes: [element] }), {
      format: 'text/html',
    });
  }, [editor, element]);

  const onAdd = useCallback(() => {
    const at = findPath(editor as ReactEditor, element);
    if (at) {
      insertNodeIntoColumns(
        editor,
        {
          type: ELEMENT_VARIABLE_DEF,
          variant: element.variant,
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
    }
  }, [editor, element]);

  if (deleted) {
    return <></>;
  }

  const { color } = element.children[0];

  return (
    <div {...attributes} contentEditable={true}>
      <DraggableBlock
        blockKind="interactive"
        element={element}
        onDelete={onDelete}
      >
        <organisms.VariableEditor
          onConvert={onConvert}
          onDelete={onDelete}
          onCopy={onCopy}
          onAdd={onAdd}
          color={color as AvailableSwatchColor}
          readOnly={readOnly}
        >
          {children}
        </organisms.VariableEditor>
      </DraggableBlock>
    </div>
  );
};
