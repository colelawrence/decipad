import { dequal } from '@decipad/utils';
import { AST, ProgramBlock } from '..';

type Arg = AST.Node['args'][number];
const areArgsEqual = (a: Arg, b: Arg) => {
  if (a == null) {
    return b == null;
  }
  const typeOfA = typeof a;
  if (typeOfA !== typeof b) {
    return false;
  }
  if (typeOfA === 'object') {
    return areNodesEqual(a as AST.Node, b as AST.Node);
  }
  return dequal(a, b);
};

const areNodesEqual = (a: AST.Node, b: AST.Node): boolean => {
  for (const [key, value] of Object.entries(a)) {
    if (
      key !== 'inferredType' &&
      key !== 'args' &&
      !dequal(value, b[key as keyof typeof b])
    ) {
      return false;
    }
  }
  if (a.args == null) {
    return b.args == null;
  }
  if (a.args.length !== b.args.length) {
    return false;
  }
  const aArgs = a.args;
  const bArgs = b.args;
  if (!Array.isArray(aArgs) || !Array.isArray(bArgs)) {
    throw new Error('statement args should be arrays');
  }
  return (aArgs as Array<Arg>).every((arg, index) =>
    areArgsEqual(arg, bArgs[index])
  );
};

export const areBlocksEqual = (
  a: AST.Block | undefined,
  b: AST.Block | undefined
): boolean => {
  if (a == null) {
    return b === null;
  }
  if (b == null) {
    return false;
  }
  if (a === b) {
    return true;
  }
  return (
    a.id === b.id &&
    a.args.length === b.args.length &&
    a.args.every((arg, i) => areNodesEqual(arg, b.args[i]))
  );
};

export const areProgramBlocksEqual = (
  a: ProgramBlock | undefined,
  b: ProgramBlock | undefined
) => areBlocksEqual(a?.block, b?.block);
