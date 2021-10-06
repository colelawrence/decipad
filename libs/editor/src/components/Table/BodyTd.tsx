import { useEffect } from 'react';
import {
  PlatePluginComponent,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { Editor, Path, Transforms } from 'slate';
import { ReactEditor, useSelected } from 'slate-react';

import { TdElement } from '@decipad/ui';
import { getDefined, noop } from '@decipad/utils';
import { TableCellType, Td } from '../../plugins/InteractiveTable/table';

export const validateNumber = (editor: Editor, cellPath: Path): void => {
  const cellTextPath = [...cellPath, 0];
  const currentText = Editor.string(editor, cellPath);

  if (Number.isNaN(Number(currentText))) {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: cellTextPath });
      Transforms.insertNodes(editor, { text: '' }, { at: cellTextPath });
    });
  }
};

const validators: Record<
  TableCellType,
  (editor: Editor, cellPath: Path) => void
> = {
  number: validateNumber,
  string: noop,
};

export const BodyTd: PlatePluginComponent = ({ element, ...props }) => {
  const editor = getDefined(useStoreEditorState(useEventEditorId('focus')));

  const { cellType } = (element as Td).attributes;
  const selected = useSelected();

  useEffect(() => {
    if (selected === false) {
      validators[cellType](editor, ReactEditor.findPath(editor, element));
    }
  }, [editor, element, cellType, selected]);

  return <TdElement element={element} {...props} />;
};
