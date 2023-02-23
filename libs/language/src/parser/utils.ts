import DeciNumber, { N } from '@decipad/number';
import { AST } from '..';
import { getIdentifierString, isNode, isStatement } from '../utils';

export const prettyPrintAST = (node: AST.Node, indent = 0): string => {
  const perLine = isStatement(node) || ['block', 'table'].includes(node.type);

  let printedArgs: string[];
  let fname: string;

  switch (node.type) {
    case 'literal': {
      const [, value, numberFormat] = node.args;

      if (value instanceof DeciNumber) {
        return numberFormat === 'percentage'
          ? `${value.mul(N(100)).toString()}%`
          : value.toString();
      }
      return JSON.stringify(value);
    }
    case 'property-access': {
      const [ref, prop] = node.args;
      return `(prop ${prettyPrintAST(ref, indent + 1)}.${prop})`;
    }
    case 'function-call': {
      [fname] = node.args[0].args;
      printedArgs = node.args[1].args.map((arg) =>
        prettyPrintAST(arg, indent + 1)
      );
      break;
    }
    case 'table': {
      const [tName, ...colItems] = node.args;
      fname = `table ${tName.args[0]}`;
      printedArgs = Array.from(colItems, (item) => {
        if (item.type === 'table-column') {
          const [colName, val] = item.args;
          return `${colName.args[0]} ${prettyPrintAST(val, indent + 1)}`;
        } else {
          return `...${getIdentifierString(item.args[0])}`;
        }
      });
      break;
    }
    case 'column': {
      fname = 'column';
      printedArgs = Array.from(node.args[0].args, (item) => {
        return prettyPrintAST(item, indent + 1);
      });
      break;
    }
    default: {
      fname = node.type;
      printedArgs = (node.args as (AST.Node | unknown)[]).flatMap(
        function printArg(a): string | string[] {
          if (isNode(a)) {
            return prettyPrintAST(a, indent + 1);
          } else if (Array.isArray(a)) {
            return a.flatMap(printArg);
          } else {
            return String(a);
          }
        }
      );
    }
  }

  if (perLine && printedArgs.length > 0) {
    const args = printedArgs.map((a) => '  '.repeat(indent + 1) + a);

    return `(${fname}\n${args.join('\n')})`;
  } else if (printedArgs.length) {
    return `(${fname} ${printedArgs.join(' ')})`;
  } else {
    return `(${fname})`;
  }
};
