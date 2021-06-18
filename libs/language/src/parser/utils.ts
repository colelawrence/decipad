import { stringifyUnits } from '../type/units';
import { isNode, isStatement } from '../utils';

const prettyPrint = (node: AST.Node, indent: number) => {
  const perLine = isStatement(node) || node.type === 'block';

  let printedArgs: string[];
  let fname: string;

  switch (node.type) {
    case 'literal': {
      const [type, value, units] = node.args;
      if (type === 'number' && units != null && units.length > 0) {
        return `${value}${stringifyUnits(units)}`;
      } else {
        return JSON.stringify(value);
      }
    }
    case 'function-call': {
      fname = node.args[0].args[0];
      printedArgs = node.args[1].args.map((arg) =>
        prettyPrint(arg, indent + 1)
      );
      break;
    }
    default: {
      fname = node.type;
      printedArgs = (node.args as (AST.Node | unknown)[]).flatMap(
        function printArg(a): string | string[] {
          if (isNode(a)) {
            return prettyPrint(a, indent + 1);
          } else if (Array.isArray(a)) {
            return a.flatMap(printArg);
          } else {
            return String(a);
          }
        }
      );
    }
  }

  let argsStr;
  if (perLine) {
    argsStr =
      '\n' + printedArgs.map((a) => '  '.repeat(indent + 1) + a).join('\n');
  } else {
    argsStr = printedArgs.join(' ');
  }

  return `(${fname} ${argsStr})`;
};

export const prettyPrintAST = (ast: AST.Node) => {
  return prettyPrint(ast, 0);
};
