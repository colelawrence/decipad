import {
  deleteText,
  getNodeProps,
  isElement,
  isText,
  setNodes,
  TEditor,
  TElement,
  TNode,
  TNodeEntry,
  TNodeProps,
  unsetNodes,
} from '@udecode/plate';
import { NormalizerReturnValue } from '../pluginFactories';

const baseProps = {
  element: ['type', 'children', 'id', 'isHidden'],
  text: ['text'],
};

const basePropsFor = (node: TNode): string[] => {
  return isElement(node) ? baseProps.element : baseProps.text;
};

const assertElementOrText = ([node, path]: TNodeEntry): void => {
  if (!isElement(node) && !isText(node)) {
    console.error(
      'Detected a node',
      node,
      'that is neither element nor text - at path',
      path
    );
    throw new Error('Detected a node that is neither element nor text');
  }
  if (isElement(node) && isText(node)) {
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
  editor: TEditor,
  entry: TNodeEntry,
  allowedPropKeys: string[] = []
): NormalizerReturnValue => {
  assertElementOrText(entry);
  const [node, path] = entry;
  const propKeys = Object.keys(getNodeProps(node));
  const basePropKeys = basePropsFor(node);

  const excessPropKeys = propKeys.filter(
    (key) => !basePropKeys.includes(key) && !allowedPropKeys.includes(key)
  );
  if (excessPropKeys.length) {
    return () => unsetNodes<TElement>(editor, excessPropKeys, { at: path });
  }
  return false;
};

/**
 * Transforms given node entry to have the required properties. If necessary and possible, creates the missing properties as empty strings.
 * @param mandatoryPropKeys The required properties in addition to the common properties like `children` or `text`.
 * @param missingPropGenerator A function to fill missing mandatory props with values.
 * @returns Whether there were excess properties removed.
 */
export const normalizeMissingProperties = (
  editor: TEditor,
  entry: TNodeEntry,
  mandatoryPropKeys: string[] = [],
  missingPropGenerator: Record<string, () => unknown> = {}
): NormalizerReturnValue => {
  assertElementOrText(entry);
  const [node, path] = entry;
  const presentPropKeys = Object.keys(getNodeProps(node));

  let newProps: TNodeProps<TElement> = {};

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
    return () => deleteText(editor, { at: path });
  }

  if (Object.keys(newProps).length) {
    return () => setNodes(editor, newProps, { at: path });
  }
  return false;
};
