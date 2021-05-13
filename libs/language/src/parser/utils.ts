import { isNode, isStatement } from '../utils';

const prettyPrint = (node: AST.Node, indent = 0) => {
  const { type, args } = node;
  const perLine = isStatement(node) || type === 'block';

  const printedArgs = (args as (AST.Node | unknown)[]).flatMap(
    function printArg(a): string | string[] {
      if (isNode(a)) {
        if (a.type === 'literal') {
          return JSON.stringify(a.args[1]);
        } else {
          return prettyPrint(a, indent + 1);
        }
      } else if (Array.isArray(a)) {
        return a.flatMap(printArg);
      } else {
        return String(a);
      }
    }
  );

  let argsStr;
  if (perLine) {
    argsStr =
      '\n' + printedArgs.map((a) => '  '.repeat(indent + 1) + a).join('\n');
  } else {
    argsStr = printedArgs.join(' ');
  }

  return `(${type} ${argsStr})`;
};

export const prettyPrintAST = (ast: AST.Node) => {
  return prettyPrint(ast, 0);
};
