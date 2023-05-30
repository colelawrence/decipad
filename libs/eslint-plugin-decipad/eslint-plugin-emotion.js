/* eslint-env es6 */
module.exports = {
  rules: {
    'css-prop-named-variable': {
      meta: { fixable: 'code' },
      create: function (context) {
        let isFixed = false;
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
                  fix: function (fixer) {
                    if (!isFixed) {
                      isFixed = true;
                      const sourceCode = context.getSourceCode();
                      const firstToken = sourceCode.getFirstToken(
                        sourceCode.ast
                      );

                      return fixer.insertTextBefore(
                        firstToken,
                        '/* eslint decipad/css-prop-named-variable: 0 */\n'
                      );
                    }
                    // if already fixed, don't apply fix but still report the problem
                    return null;
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};
