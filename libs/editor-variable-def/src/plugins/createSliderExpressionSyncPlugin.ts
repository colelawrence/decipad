import { createOverrideApplyPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  MyElement,
  SliderElement,
  ExpressionElement,
} from '@decipad/editor-types';
import {
  getNextNode,
  getNode,
  getNodeEntry,
  getNodeString,
  getParentNode,
  getPreviousNode,
  insertText,
  isElement,
  isText,
  setNodes,
  TNode,
} from '@udecode/plate';
import { parseNumberWithUnit } from '@decipad/computer';
import { Path } from 'slate';

const isExpression = (n: TNode) =>
  isElement(n) && n.type === ELEMENT_EXPRESSION;
const isSlider = (n: TNode) => isElement(n) && n.type === ELEMENT_SLIDER;

export const createSliderExpressionSyncPlugin =
  createOverrideApplyPluginFactory({
    name: 'SLIDER_EXPRESSION_SYNC_PLUGIN',
    plugin: (editor, apply) => {
      return (op) => {
        apply(op);
        if (
          op.type !== 'set_node' &&
          op.type !== 'insert_text' &&
          op.type !== 'remove_text'
        ) {
          return;
        }

        const entry = isText(getNode<MyElement>(editor, op.path))
          ? getParentNode<MyElement>(editor, op.path)
          : getNodeEntry<MyElement>(editor, op.path);
        if (!entry) {
          return;
        }

        const [node, path] = entry;
        if (
          op.type === 'set_node' &&
          node.type === ELEMENT_SLIDER &&
          'value' in op.newProperties
        ) {
          const [sliderNode, sliderPath] = entry;
          const expressionEntry = getPreviousNode<ExpressionElement>(editor, {
            at: sliderPath,
            match: (n, p) => isExpression(n) && Path.isSibling(path, p),
          });
          if (!expressionEntry) {
            return;
          }

          const [expressionNode, expressionPath] = expressionEntry;
          const expression = getNodeString(expressionNode);
          const [value, rest] = parseNumberWithUnit(expression) ?? [];

          if (Number(sliderNode.value) === value) {
            return;
          }

          insertText(editor, `${sliderNode.value}${rest ?? expression ?? ''}`, {
            at: expressionPath,
          });
        }

        if (
          (op.type === 'insert_text' || op.type === 'remove_text') &&
          node.type === ELEMENT_EXPRESSION
        ) {
          const [expressionNode, expressionPath] = entry;
          const sliderEntry = getNextNode<SliderElement>(editor, {
            at: expressionPath,
            match: (n, p) => isSlider(n) && Path.isSibling(path, p),
          });
          if (!sliderEntry) {
            return;
          }

          const [sliderNode, sliderPath] = sliderEntry;
          const [value] =
            parseNumberWithUnit(getNodeString(expressionNode)) ?? [];

          if (value == null || Number(sliderNode.value) === value) {
            return;
          }

          setNodes(
            editor,
            { value: value.toString() },
            { at: sliderPath, match: isSlider }
          );
        }
      };
    },
  });
