import {
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { FC, useCallback } from 'react';
import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getDefined } from '@decipad/utils';

import { TableData } from './types';
import { TableInner } from './TableInner';

export const Table: PlatePluginComponent = ({
  children,
  element,
  attributes,
}): ReturnType<FC> => {
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

  const value = element.tableData as TableData;

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
