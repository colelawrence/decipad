import { AST } from '..';
import { Computer } from '../computer/Computer';
import { getExprRef } from '../exprRefs';
import { Program } from '../types';

export const isInUse = (
  computer: Computer,
  program: Program,
  ...blockIds: string[]
): boolean => {
  const varNames = new Set(
    blockIds.flatMap((id) => {
      const result = computer.getBlockIdResult$.get(id);
      const block = program.find((p) => p.id === id)?.block;

      if (result?.type !== 'computer-result' || !block) {
        return [];
      } else {
        return getDefinedSymbols(block);
      }
    })
  );

  return program.some((p) => {
    const stat = p.block?.args.at(0);
    const result = computer.getBlockIdResult$.get(p.id);
    if (!stat || result?.type !== 'computer-result') {
      return false;
    }

    return result.usedNames
      ?.map(([ns, name]) => (ns ? `${ns}.${name}` : name))
      ?.some((sym) => varNames.has(sym));
  });
};

const getDefinedSymbols = (block: AST.Block) =>
  block.args
    .flatMap((stat) => {
      switch (stat.type) {
        case 'assign':
          return [stat.args[0].args[0]];
        case 'table':
          return [stat.args[0].args[0]];
        case 'categories':
          return [stat.args[0].args[0]];
        case 'function-definition':
          return [stat.args[0].args[0]];
        case 'table-column-assign':
          return [`${stat.args[0].args[0]}.${stat.args[1].args[0]}`];
        default:
          return [];
      }
    })
    .concat(getExprRef(block.id ?? ''));
