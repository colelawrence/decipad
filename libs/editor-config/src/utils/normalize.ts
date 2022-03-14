import { Editor, Node, NodeEntry, Element, Text, Transforms } from 'slate';

/**
 * Transforms given node entry to not have extra properties.
 * @param allowedPropKeys The properties to allow in addition to the common properties like `children` or `text`.
 * @returns Whether there were excess properties removed.
 */
export const normalizeExcessProperties = (
  editor: Editor,
  [node, path]: NodeEntry,
  allowedPropKeys: string[] = []
): boolean => {
  if (!Element.isElement(node) && !Text.isText(node)) {
    console.error(
      'Detected a node',
      node,
      'that is neither element nor text - at path',
      path
    );
    throw new Error('Detected a node that is neither element nor text');
  }
  if (Element.isElement(node) && Text.isText(node)) {
    console.error(
      'Detected a node',
      node,
      'that is both element and text - at path',
      path
    );
    throw new Error('Detected a node that is both element and text');
  }

  const propKeys = Object.keys(Node.extractProps(node));
  const basePropKeys = Element.isElement(node)
    ? ['type', 'children', 'id']
    : ['text'];

  const excessPropKeys = propKeys.filter(
    (key) => !basePropKeys.includes(key) && !allowedPropKeys.includes(key)
  );
  Transforms.unsetNodes(editor, excessPropKeys, { at: path });
  return !!excessPropKeys.length;
};
