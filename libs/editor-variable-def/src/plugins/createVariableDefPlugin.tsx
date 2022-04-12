import { PlatePlugin } from '@udecode/plate';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { Computer } from '@decipad/language';
import { DECORATION_EXPRESSION_SYNTAX } from '../constants';
import { VariableDef, Caption, Expression, CodeSyntax } from '../components';
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
      { validNodeName: 'div', validAttribute: { 'data-type': 'var-def' } },
    ],
  },
  serializeHtml: (props) => <div data-type="var-def">{props.children}</div>,
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
  ],
});
