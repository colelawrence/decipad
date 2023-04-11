import { isElement, setNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { MyEditor, MyElement, MyNodeEntry } from '@decipad/editor-types';
import { NormalizerReturnValue } from '../../pluginFactories';

export const normalizeElementIdPlugin =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): NormalizerReturnValue => {
    if (isElement(node) && !node.id) {
      const newId = nanoid();
      // eslint-disable-next-line no-console
      return () => setNodes<MyElement>(editor, { id: newId }, { at: path });
    }
    return false;
  };
