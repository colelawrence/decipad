import {
  MyNode,
  MyEditor,
  MyElement,
  VariableDefinitionElement,
} from '@decipad/editor-types';
import { convertVariableDefInto } from '@decipad/editor-utils';
import {
  findNodePath,
  replaceNodeChildren,
  setNodes,
} from '@udecode/plate-common';
import { ColorSwatchOrAuto } from '../proxy-fields';

export const setNodeProperty = <N extends MyNode, K extends keyof N>(
  editor: MyEditor,
  node: N,
  key: K,
  value: unknown extends N[K] ? never : N[K]
) => {
  const path = findNodePath(editor, node);
  if (!path) return;
  setNodes(editor, { [key]: value }, { at: path });
};

export const setNodeText = (
  editor: MyEditor,
  node: MyElement,
  text: string
) => {
  const path = findNodePath(editor, node);
  if (!path) return;
  replaceNodeChildren(editor, {
    at: path,
    nodes: [{ text }],
  });
};

export const mapVariableProperties = (node: VariableDefinitionElement) => {
  const [caption, expression] = node.children;
  return {
    name: caption.children[0].text,
    variant: node.variant,
    color: (caption.color ?? 'auto') as ColorSwatchOrAuto,
    value: expression.children[0].text,
  };
};

export const variableActions = {
  setName: (node: VariableDefinitionElement, editor: MyEditor, name: string) =>
    setNodeText(editor, node.children[0], name),
  setVariant: (
    node: VariableDefinitionElement,
    editor: MyEditor,
    variant: VariableDefinitionElement['variant']
  ) => convertVariableDefInto(editor, node)(variant),
  setColor: (
    node: VariableDefinitionElement,
    editor: MyEditor,
    color: ColorSwatchOrAuto
  ) =>
    setNodeProperty(
      editor,
      node.children[0],
      'color',
      color === 'auto' ? undefined : color
    ),
  setValue: (
    node: VariableDefinitionElement,
    editor: MyEditor,
    value: string
  ) => setNodeText(editor, node.children[1], value),
};

const normalizeNumber = (value: string, allowNegative: boolean) => {
  let normalizedValue = value;

  // Remove all characters except digits and '.'
  normalizedValue = normalizedValue.replaceAll(/[^0-9.]/g, '');

  // Reinsert '-' at start of number
  if (allowNegative && value.startsWith('-')) {
    normalizedValue = `-${normalizedValue}`;
  }

  return normalizedValue;
};

export const normalizeRationalNumber = (value: string) =>
  normalizeNumber(value, true);

export const normalizeNonNegativeNumber = (value: string) =>
  normalizeNumber(value, false);
