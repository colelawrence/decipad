import {
  mutateAst,
  isIdentifier,
  isExpression,
  AST,
  decilang,
} from '@decipad/language';
import { memoizePrimitive } from '@decipad/utils';
import produce from 'immer';
import { Program, ProgramBlock } from '../types';
import { getDefinedSymbol, getIdentifierString } from '../utils';
import { removeLegacyTableColumnReferences } from './makeNamesFromIdsTechDebt';
import { assertIsExprRef, getExprRef, isExprRef } from '.';

/**
 * Takes exprRef_xxxx references and replaces them with variable names
 */
export const replaceExprRefsWithPrettyRefs = (
  program: Program
): [Program, Set<string>] => {
  // 1 + 1  --->  exprRef_1234 = 1 + 1
  const autoAssigned = plainExpressionsToAssignments(program);

  // TODO -- make sure nobody refers to exprRef_columnID but actually means the whole column!
  // Then delete this
  const noLegacyTableColumnReferences =
    removeLegacyTableColumnReferences(autoAssigned);

  // MyVar = 1 + exprRef_4567  --->  MyVar = 1 + TheVariableName
  // exprRef_1234 = 1  --->  Value_1 = 1
  // exprRef_Table_Column_ID  --->  Table.Column
  const [renamed, generatedNames] = replaceAllBlockIdReferences(
    noLegacyTableColumnReferences
  );

  return [renamed, new Set(generatedNames)];
};

/** Make sure every non-assignment is an assignment to a block ID */
function plainExpressionsToAssignments(program: Program) {
  return program.map(
    produce<ProgramBlock>((block) => {
      if (block.type === 'identified-block') {
        const stats = block.block.args;

        if (isExpression(stats[0])) {
          // 1 + 1 --> Value_1 = 1 + 1
          stats[0] = decilang<AST.Assign>`${{ name: getExprRef(block.id) }} = ${
            stats[0]
          }`;
        } else if (
          stats[0].type === 'assign' &&
          !getIdentifierString(stats[0].args[0]).trim()
        ) {
          // Empty var names
          stats[0].args[0].args[0] = getExprRef(block.id);
        }
      }
    })
  );
}

function replaceAllBlockIdReferences(program: Program): [Program, Set<string>] {
  const genVarName = makeVarNameLookup(program);

  const generatedNames = new Set<string>();
  const newProgram = program.map(
    produce((block) => {
      if (block.type === 'identified-block') {
        mutateAst(block.block, (thing) => {
          if (isIdentifier(thing)) {
            const varName = getIdentifierString(thing);
            if (isExprRef(varName)) {
              const { newName, wasGenerated } = genVarName(varName);
              thing.args[0] = newName;
              if (wasGenerated) {
                generatedNames.add(thing.args[0]);
              }
            }
          }

          return thing;
        });
      }
    })
  );

  return [newProgram, generatedNames];
}

const makeVarNameLookup = (program: Program) => {
  const [idsToPretty, prettyToIds] = gatherAllVarNames(program);

  return memoizePrimitive((asBlockRef: string) => {
    assertIsExprRef(asBlockRef);

    // First, attempt to use the variable's non-ambiguous name
    const prettyName = idsToPretty.get(asBlockRef);
    if (prettyName && prettyToIds.has(prettyName)) {
      return { newName: prettyName, wasGenerated: false };
    }

    // Generate a new name that's non-ambiguous
    const newName = tryVarNames(prettyName, (name) => !prettyToIds.has(name));

    prettyToIds.set(newName, asBlockRef);

    return { newName, wasGenerated: true };
  });
};

/** Try original, original_1, original_2, etc. */
const tryVarNames = (
  original: string | undefined,
  isNameGood: (name: string) => boolean
) => {
  if (original && isNameGood(original)) {
    return original;
  }

  let i = 1;
  let proposal;
  const prefix = original ? `${original.replace(/_+\d*$/, '')}_` : 'Value_';
  do {
    proposal = `${prefix}${i}`;
    i++;
  } while (!isNameGood(proposal));

  return proposal;
};

function gatherAllVarNames(program: Program) {
  const idsToPretty = new Map<string, string>();
  const prettyToIds = new Map<string, string>();

  program.map(
    produce((block: ProgramBlock) => {
      if (block.type === 'identified-block') {
        const exprRef = getExprRef(block.id);
        let symbol =
          getDefinedColumn(block.block.args[0] ?? { type: 'noop', args: [] }) ??
          getDefinedSymbol(
            block.block.args[0] ?? { type: 'noop', args: [] },
            false
          ) ??
          '';

        if (isExprRef(symbol)) {
          symbol = '';
        }

        if (symbol) {
          prettyToIds.set(symbol, exprRef);
        }
        idsToPretty.set(exprRef, symbol);
      }
    })
  );

  return [idsToPretty, prettyToIds] as const;
}

function getDefinedColumn(arg0: AST.Statement) {
  switch (arg0.type) {
    case 'table-column-assign':
      return arg0.args[1].args[0];
  }
  return undefined;
}
