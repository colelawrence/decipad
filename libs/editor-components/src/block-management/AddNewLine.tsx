import { MyElement, useMyEditorRef } from '@decipad/editor-types';
import { NewElementLine } from '@decipad/ui';
import {
  findNodePath,
  getPreviousNode,
  insertNodes,
  select,
} from '@udecode/plate-common';
import { FC, useCallback } from 'react';
import { insertSameNodeType } from '../utils';
import { useComputer } from '@decipad/editor-hooks';
import { useInsideLayoutContext } from '@decipad/react-contexts';

type AddNewLineProps = {
  element: MyElement;
};

export const ConcreteAddNewLine: FC<AddNewLineProps> = ({ element }) => {
  const editor = useMyEditorRef();
  const computer = useComputer();

  const onAdd = useCallback(() => {
    const path = findNodePath(editor, element);
    if (path == null) return;

    const entry = getPreviousNode(editor, {
      at: path,
    });

    const [prevNode] = entry ?? [];

    insertNodes(editor, [insertSameNodeType(prevNode as MyElement, computer)], {
      at: path,
    });

    select(editor, path);
  }, [element, editor, computer]);

  return <NewElementLine onAdd={onAdd} />;
};

export const AddNewLine: FC<AddNewLineProps> = (props) => {
  const isInsideLayout = useInsideLayoutContext();

  if (isInsideLayout) {
    return null;
  }

  return <ConcreteAddNewLine {...props} />;
};
