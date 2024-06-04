// eslint-disable-next-line no-restricted-imports
import type { AST } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import type { FullBuiltinSpec } from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
import { operators } from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
import { walkAst, getIdentifierString } from '@decipad/language-utils';

export const fakeFunctionCall = (
  fnCall: AST.FunctionCall,
  fnNameReplacement: string
): AST.FunctionCall => {
  const [, args] = fnCall.args;
  const replacementFnRef: AST.FuncRef = {
    type: 'funcref',
    args: [fnNameReplacement],
  };
  return {
    ...fnCall,
    args: [replacementFnRef, args],
  };
};

export const requiresWholeColumn = (expr: AST.Expression): boolean => {
  let requires = false;

  const visitFunctionCall = (fnCall: AST.FunctionCall): void => {
    const functionName = getIdentifierString(fnCall.args[0]);
    const builtIn = operators[functionName];
    if (builtIn) {
      if (builtIn.aliasFor) {
        return visitFunctionCall(fakeFunctionCall(fnCall, builtIn.aliasFor));
      }
      if ((builtIn as FullBuiltinSpec).coerceToColumn) {
        requires = true;
      }
    }
  };

  const visitNode = (node: AST.Node) => {
    if (node.type === 'function-call') {
      visitFunctionCall(node);
    }
  };

  walkAst(expr, visitNode);

  return requires;
};
