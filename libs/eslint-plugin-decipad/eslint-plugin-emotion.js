/* eslint-env es6 */
module.exports = {
  rules: {
    'css-prop-named-variable': {
      create: function (context) {
        return {
          JSXAttribute: function (node) {
            if (
              node.name.name === 'css' &&
              node.value.type === 'JSXExpressionContainer'
            ) {
              const expression = node.value.expression;
              if (expression.type !== 'Identifier') {
                context.report({
                  node,
                  message: 'The css prop should use a named variable.',
                });
              }
            }
          },
        };
      },
    },
  },
};
