import {
  ENodeEntry,
  TEditor,
  TNodeProps,
  Value,
  isElement,
  setNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { MyGenericEditor } from '@decipad/editor-types';
import { NormalizerReturnValue } from '../../pluginFactories';

export const normalizeElementIdPlugin =
  <TV extends Value, TE extends MyGenericEditor<TV>>() =>
  (editor: TE) =>
  ([node, path]: ENodeEntry<TV>): NormalizerReturnValue => {
    if (isElement(node) && !node.id) {
      const newId = nanoid();
      // eslint-disable-next-line no-console
      return () =>
        setNodes(
          editor,
          { id: newId } as unknown as Partial<TNodeProps<TEditor<TV>>>,
          { at: path }
        );
    }
    return false;
  };
