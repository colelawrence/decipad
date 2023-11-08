import { AST } from '..';
import { walkAst, getIdentifierString } from '../utils';
import { operators } from '../builtins/index';

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
      if (builtIn.coerceToColumn) {
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
