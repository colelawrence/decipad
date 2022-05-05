import { PlatePlugin } from '@udecode/plate';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
  isElement,
} from '@decipad/editor-types';
import { Computer } from '@decipad/language';
import { DECORATION_EXPRESSION_SYNTAX } from '../constants';
import {
  VariableDef,
  Caption,
  Expression,
  CodeSyntax,
  Slider,
} from '../components';
import { createNormalizeVariableDefPlugin } from './createNormalizeVariableDefPlugin';
import { createMigrateElementInputToVariableDefPlugin } from './createMigrateElementInputToVariableDefPlugin';
import { createNormalizeCaptionPlugin } from './createNormalizeCaptionPlugin';
import { createNormalizeExpressionPlugin } from './createNormalizeExpressionPlugin';
import { createEnterOnExpressionPlugin } from './createEnterOnExpressionPlugin';
import { decorateExpression } from '../utils/decorateExpression';

export const createVariableDefPlugin = (computer: Computer): PlatePlugin => ({
  key: ELEMENT_VARIABLE_DEF,
  isElement: true,
  component: VariableDef,
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'div',
        validAttribute: { 'data-type': `var-${ELEMENT_VARIABLE_DEF}` },
      },
    ],
    getNode: (el) => {
      return {
        type: ELEMENT_VARIABLE_DEF,
        variant: el.getAttribute('data-variant'),
        children: el.children, // what to do?
      };
    },
  },
  serializeHtml: ({ element, children }) => {
    if (!isElement(element)) {
      throw new Error('expected element');
    }
    if (element.type !== ELEMENT_VARIABLE_DEF) {
      throw new Error('expected variable definition element');
    }
    return (
      <div
        data-type={`var-${ELEMENT_VARIABLE_DEF}`}
        data-variant={element.variant}
      >
        {children}
      </div>
    );
  },
  plugins: [
    createMigrateElementInputToVariableDefPlugin(),
    createNormalizeVariableDefPlugin(),
    createNormalizeCaptionPlugin(),
    createNormalizeExpressionPlugin(),
    createEnterOnExpressionPlugin(),
    {
      key: ELEMENT_CAPTION,
      isElement: true,
      component: Caption,
      deserializeHtml: {
        rules: [{ validAttribute: { 'data-type': 'caption' } }],
      },
      serializeHtml: (props) => <div data-type="caption">{props.children}</div>,
    },
    {
      key: ELEMENT_EXPRESSION,
      isElement: true,
      component: Expression,
      deserializeHtml: {
        rules: [
          {
            validNodeName: 'caption',
            validAttribute: { 'data-type': 'expression' },
          },
        ],
      },
      serializeHtml: (props) => (
        <div data-type="expression">{props.children}</div>
      ),
    },
    {
      key: DECORATION_EXPRESSION_SYNTAX,
      type: DECORATION_EXPRESSION_SYNTAX,
      isLeaf: true,
      decorate: decorateExpression(computer),
      component: CodeSyntax,
    },
    {
      key: ELEMENT_SLIDER,
      isElement: true,
      component: Slider,
      deserializeHtml: {
        rules: [
          {
            validNodeName: 'div',
            validAttribute: { 'data-type': ELEMENT_SLIDER },
          },
        ],
      },
      serializeHtml: (props) => (
        <div data-type={ELEMENT_SLIDER}>{props.children}</div>
      ),
    },
  ],
});
