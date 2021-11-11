import { AST } from '..';
import { stringifyUnits } from '../type/units';
import { getIdentifierString, isNode, isStatement } from '../utils';

const prettyPrint = (node: AST.Node, indent: number): string => {
  const perLine = isStatement(node) || ['block', 'table'].includes(node.type);

  let printedArgs: string[];
  let fname: string;

  switch (node.type) {
    case 'literal': {
      const [, value, units] = node.args;
      return [
        JSON.stringify(value),
        units && prettyPrint(units, indent + 1),
      ].join('');
    }
    case 'units': {
      return stringifyUnits(node);
    }
    case 'property-access': {
      const [ref, prop] = node.args;
      return `(prop ${getIdentifierString(ref)}.${prop})`;
    }
    case 'function-call': {
      [fname] = node.args[0].args;
      printedArgs = node.args[1].args.map((arg) =>
        prettyPrint(arg, indent + 1)
      );
      break;
    }
    case 'table': {
      fname = 'table';
      printedArgs = Array.from(node.args, (item) => {
        if (item.type === 'table-column') {
          const [colName, val] = item.args;
          return `${colName.args[0]} ${prettyPrint(val, indent + 1)}`;
        } else {
          return `...${getIdentifierString(item.args[0])}`;
        }
      });
      break;
    }
    case 'column': {
      fname = 'column';
      printedArgs = Array.from(node.args[0].args, (item) => {
        return prettyPrint(item, indent + 1);
      });
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

  if (perLine) {
    const args = printedArgs.map((a) => '  '.repeat(indent + 1) + a);

    return `(${fname}\n${args.join('\n')})`;
  } else {
    return `(${fname} ${printedArgs.join(' ')})`;
  }
};

export const prettyPrintAST = (ast: AST.Node) => prettyPrint(ast, 0);

export const prettyPrintSolutions = (asts: AST.Node[]) =>
  asts
    .map((solution) => `Result:\n${prettyPrintAST(solution)}\n-------\n`)
    .join('') || 'No solutions!';
