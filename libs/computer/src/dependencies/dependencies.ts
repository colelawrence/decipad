import { AST } from '..';
import { Computer } from '../computer/Computer';
import { getExprRef } from '../exprRefs';
import { BlocksInUseInformation, Program } from '../types';

export const programDependencies = (
  computer: Computer,
  program: Program,
  ...blockIds: string[]
): BlocksInUseInformation[] => {
  const allVarNames: string[] = [];
  const varNames = new Map<string, string>();
  blockIds.flatMap((id) => {
    const result = computer.getBlockIdResult$.get(id);
    const block = program.find((p) => p.id === id)?.block;
    if (!(result?.type !== 'computer-result' || !block)) {
      const blockSymbols = getDefinedSymbols(block);
      blockSymbols.forEach((symbol) => {
        if (symbol !== '') {
          if (!symbol.startsWith('exprRef_')) {
            allVarNames.push(symbol);
          }
          varNames.set(symbol, id);
        }
      });
    }
  });

  const programDependencyGraph = program
    .map((p) => {
      const usedInBlockId = p.id;
      const stat = p.block?.args.at(0);
      const result = computer.getBlockIdResult$.get(p.id);
      if (!stat || result?.type !== 'computer-result') {
        return [];
      }

      return (
        result.usedNames
          ?.map(([ns, name]) => (ns ? `${ns}.${name}` : name))
          ?.filter((varName) => varNames.has(varName))
          ?.map((varName: string) => {
            const inBlockId = varNames.get(varName);
            return { varName, inBlockId, usedInBlockId };
          }) || []
      );
    })
    .flatMap((a) => a);

  return allVarNames.flatMap((currentName) => {
    const allMatchingVarName = programDependencyGraph.filter(
      (obj) => obj.varName === currentName
    );
    if (allMatchingVarName && allMatchingVarName.length !== 0) {
      const { varName, inBlockId } = allMatchingVarName[0];
      return {
        varName,
        inBlockId,
        usedInBlockId: allMatchingVarName.map(
          (blockInfo) => blockInfo.usedInBlockId
        ),
      };
    } else {
      return { varName: currentName, usedInBlockId: [] };
    }
  });
};

export const blocksInUse = (
  computer: Computer,
  program: Program,
  ...blockIds: string[]
): BlocksInUseInformation[] => {
  const blocksInUseForBlockIds = programDependencies(
    computer,
    program,
    ...blockIds
  );
  return blocksInUseForBlockIds.filter(
    (blockInfo) => blockInfo.usedInBlockId.length !== 0
  );
};

export const isInUse = (
  computer: Computer,
  program: Program,
  ...blockIds: string[]
): boolean => {
  return blocksInUse(computer, program, ...blockIds).length !== 0;
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
