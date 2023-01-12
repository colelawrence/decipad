import { isElement, setNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { MyEditor, MyElement, MyNodeEntry } from '@decipad/editor-types';

export const normalizeElementIdPlugin =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry) => {
    if (isElement(node) && !node.id) {
      const newId = nanoid();
      // eslint-disable-next-line no-console
      console.log('assigning a missing id to', newId, path);
      setNodes<MyElement>(editor, { id: newId }, { at: path });
      return true;
    }

    return false;
  };
