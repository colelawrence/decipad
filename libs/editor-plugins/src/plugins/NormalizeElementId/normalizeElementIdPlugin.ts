import type {
  ENodeEntry,
  TEditor,
  TNodeProps,
  Value,
} from '@udecode/plate-common';
import { isElement, setNodes } from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import type { MyGenericEditor } from '@decipad/editor-types';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';

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
