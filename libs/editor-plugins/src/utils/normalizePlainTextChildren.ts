import type { MyGenericEditor } from '@decipad/editor-types';
import type { Value, ENodeEntry } from '@udecode/plate-common';
import {
  getNodeString,
  unwrapNodes,
  isElement,
  isText,
  removeNodes,
} from '@udecode/plate-common';
import type { NormalizerReturnValue } from '@decipad/editor-plugin-factories';
import { normalizeExcessProperties } from './normalize';

export const normalizePlainTextChildren = <
  TV extends Value,
  TE extends MyGenericEditor<TV>
>(
  editor: TE,
  children: Iterable<ENodeEntry<TV>>
): NormalizerReturnValue => {
  for (const childEntry of children) {
    const [childNode, childPath] = childEntry;

    if (isElement(childNode)) {
      const str = getNodeString(childNode);
      if (str === '') {
        // unwrapNodes does nothing if the element is empty
        return () => removeNodes(editor, { at: childPath });
      }

      return () => unwrapNodes(editor, { at: childPath });
    }

    if (isText(childNode)) {
      const normalize = normalizeExcessProperties(editor, childEntry);
      if (normalize) {
        return normalize;
      }
    }
  }

  return false;
};
