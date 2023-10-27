import { MyGenericEditor } from '@decipad/editor-types';
import {
  getNodeString,
  unwrapNodes,
  isElement,
  isText,
  removeNodes,
  Value,
  ENodeEntry,
} from '@udecode/plate';
import { normalizeExcessProperties } from './normalize';
import { NormalizerReturnValue } from '../pluginFactories';

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
