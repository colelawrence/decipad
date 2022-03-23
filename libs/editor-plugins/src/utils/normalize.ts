import { Editor, Node, NodeEntry, Element, Text, Transforms } from 'slate';

const baseProps = {
  element: ['type', 'children', 'id'],
  text: ['text'],
};

const basePropsFor = (node: Node): string[] => {
  return Element.isElement(node) ? baseProps.element : baseProps.text;
};

const assertElementOrText = ([node, path]: NodeEntry): void => {
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
};

/**
 * Transforms given node entry to not have extra properties.
 * @param allowedPropKeys The properties to allow in addition to the common properties like `children` or `text`.
 * @returns Whether there were excess properties removed.
 */
export const normalizeExcessProperties = (
  editor: Editor,
  entry: NodeEntry,
  allowedPropKeys: string[] = []
): boolean => {
  assertElementOrText(entry);
  const [node, path] = entry;
  const propKeys = Object.keys(Node.extractProps(node));
  const basePropKeys = basePropsFor(node);

  const excessPropKeys = propKeys.filter(
    (key) => !basePropKeys.includes(key) && !allowedPropKeys.includes(key)
  );
  Transforms.unsetNodes(editor, excessPropKeys, { at: path });
  return !!excessPropKeys.length;
};

/**
 * Transforms given node entry to have the required properties. If necessary and possible, creates the missing properties as empty strings.
 * @param mandatoryPropKeys The required properties in addition to the common properties like `children` or `text`.
 * @param missingPropGenerator A function to fill missing mandatory props with values.
 * @returns Whether there were excess properties removed.
 */
export const normalizeMissingProperties = (
  editor: Editor,
  entry: NodeEntry,
  mandatoryPropKeys: string[] = [],
  missingPropGenerator: Record<string, () => unknown> = {}
): boolean => {
  assertElementOrText(entry);
  const [node, path] = entry;
  const presentPropKeys = Object.keys(Node.extractProps(node));

  let newProps: Partial<Node> = {};

  for (const key of mandatoryPropKeys) {
    if (presentPropKeys.includes(key)) {
      continue;
    }

    if (key in missingPropGenerator) {
      newProps = { ...newProps, [key]: missingPropGenerator[key]() };
      continue;
    }

    console.error(
      'Element',
      node,
      'at path',
      path,
      'does not have mandatory property',
      key,
      'and we do not know how to initialize it. Deleting element.'
    );
    Transforms.delete(editor, { at: path });
    return true;
  }

  Transforms.setNodes(editor, newProps, { at: path });
  return !!Object.keys(newProps).length;
};
