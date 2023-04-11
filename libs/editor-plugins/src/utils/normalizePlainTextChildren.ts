import { MyEditor, MyNodeEntry } from '@decipad/editor-types';
import {
  getNodeString,
  unwrapNodes,
  isElement,
  isText,
  removeNodes,
} from '@udecode/plate';
import { normalizeExcessProperties } from './normalize';
import { NormalizerReturnValue } from '../pluginFactories';

export const normalizePlainTextChildren = (
  editor: MyEditor,
  children: Iterable<MyNodeEntry>
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
