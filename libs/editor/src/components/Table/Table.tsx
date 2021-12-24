import { useEventEditorId, useStoreEditorState } from '@udecode/plate';
import { FC, useCallback } from 'react';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getDefined } from '@decipad/utils';

import { TableData } from '../../utils/tableTypes';
import { TableInner } from './TableInner';
import { PlateComponent } from '../../utils/components';
import { ELEMENT_TABLE_INPUT } from '../../utils/elementTypes';

export const Table: PlateComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
  if (element?.type !== ELEMENT_TABLE_INPUT) {
    throw new Error('Table is meant to render table elements');
  }

  const editor = getDefined(
    useStoreEditorState(useEventEditorId('focus')),
    'missing editor'
  );

  const onChange = useCallback(
    (newValue: TableData) => {
      const at = ReactEditor.findPath(editor, element);

      Transforms.setNodes(editor, { tableData: newValue } as Partial<Node>, {
        at,
      });
    },
    [editor, element]
  );

  const value = element.tableData;

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  return (
    <div contentEditable={false} {...attributes}>
      {children}
      <TableInner value={value} onChange={onChange} />
    </div>
  );
};
