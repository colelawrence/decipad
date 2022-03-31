import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { TNode } from '@udecode/plate';
import { Editor, Element, Node, NodeEntry, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import { normalizeExcessProperties } from '../../utils/normalize';

const normalizeCodeLine = (editor: Editor) => (entry: NodeEntry) => {
  const [node, path] = entry as NodeEntry<TNode>;

  // Code line
  if (Element.isElement(node) && node.type === ELEMENT_CODE_LINE) {
    for (const lineChild of Node.children(editor, path)) {
      const [lineChildNode, lineChildPath] = lineChild as NodeEntry<TNode>;

      // Children must be text
      if (Element.isElement(lineChildNode)) {
        Transforms.unwrapNodes(editor, { at: lineChildPath });
        return true;
      }

      // Text must be plain
      if (normalizeExcessProperties(editor, lineChild)) {
        return true;
      }
    }
  }
  return false;
};

export const createNormalizeCodeLinePlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_CODE_LINE_PLUGIN',
  plugin: normalizeCodeLine,
});
