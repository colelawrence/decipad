import { useCallback, useState } from 'react';
import { organisms } from '@decipad/ui';
import {
  PlateComponent,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
} from '@decipad/editor-types';
import { ReactEditor, useSlate } from 'slate-react';
import { PlateEditor, serializeHtml } from '@udecode/plate';
import copy from 'copy-to-clipboard';
import {
  findPath,
  insertNodeIntoColumns,
  safeDelete,
} from '@decipad/editor-utils';
import { DraggableBlock } from '@decipad/editor-components';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { AvailableSwatchColor } from 'libs/ui/src/utils';

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
