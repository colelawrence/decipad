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
import { assertIsExprRef, getExprRef, isExprRef } from '.';

/**
 * Takes exprRef_xxxx references and replaces them with variable names
 */
export const replaceExprRefsWithPrettyRefs = (
  program: Program
): [Program, Set<string>] => {
  // 1 + 1  --->  exprRef_1234 = 1 + 1
  const autoAssigned = plainExpressionsToAssignments(program);

  // MyVar = 1 + exprRef_4567  --->  MyVar = 1 + TheVariableName
  // exprRef_1234 = 1  --->  Value_1 = 1
  // exprRef_Table_Column_ID  --->  Table.Column
  const [renamed, generatedNames] = replaceAllBlockIdReferences(
    autoAssigned,
    mapExprRefsToColumnAccess(program)
  );

  return [renamed, generatedNames];
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

/**
 * Helper function to map exprRef_tableColumnId to Table.Column
 */
function mapExprRefsToColumnAccess(
  program: Program
): Map<string, AST.PropertyAccess> {
  return new Map(
    program.flatMap((block) => {
      const columnAssign = block.block?.args[0];
      if (columnAssign?.type === 'table-column-assign') {
        const [table, column] = columnAssign.args;
        const asPropertyAccess = decilang<AST.PropertyAccess>`${{
          name: table.args[0],
        }}.${{ name: column.args[0] }}`;
        return [[getExprRef(block.id), asPropertyAccess]];
      }

      return [];
    })
  );
}

function replaceAllBlockIdReferences(
  program: Program,
  tableColumnsBySmartRef: Map<string, AST.PropertyAccess>
): [Program, Set<string>] {
  const genVarName = makeVarNameLookup(program);

  const generatedNames = new Set<string>();
  const newProgram = program.map(
    produce((block) => {
      if (block.type === 'identified-block') {
        mutateAst(block.block, (thing) => {
          if (isIdentifier(thing)) {
            const varName = getIdentifierString(thing);
            if (isExprRef(varName)) {
              /** Is this a ref to a Table.Column? */
              const asTableDotColumn = tableColumnsBySmartRef.get(varName);
              if (asTableDotColumn) {
                return asTableDotColumn;
              } else {
                const { newName, wasGenerated } = genVarName(varName);
                thing.args[0] = newName;
                if (wasGenerated) {
                  generatedNames.add(thing.args[0]);
                }
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

  let i = 0;

  return memoizePrimitive((asBlockRef: string) => {
    assertIsExprRef(asBlockRef);

    // First, attempt to use the variable's non-ambiguous name
    const prettyName = idsToPretty.get(asBlockRef);
    if (prettyName && prettyToIds.get(prettyName)?.size === 1) {
      return { newName: prettyName, wasGenerated: false };
    }

    // Generate a new name that's non-ambiguous
    const prefix = prettyName ? `${prettyName}_`.replace(/_+$/, '_') : 'Value_';

    let proposal;
    do {
      i++;
      proposal = prefix + i;
    } while (prettyToIds.get(proposal)?.size);

    return { newName: proposal, wasGenerated: true };
  });
};

function gatherAllVarNames(program: Program) {
  const idsToPretty = new Map<string, string>();
  const prettyToIds = new Map<string, Set<string>>();

  for (const block of program) {
    if (block.type === 'identified-block') {
      const exprRef = getExprRef(block.id);
      let symbol =
        getDefinedSymbol(
          block.block.args[0] ?? { type: 'noop', args: [] },
          false
        ) ?? '';

      if (isExprRef(symbol)) {
        symbol = '';
      }

      idsToPretty.set(exprRef, symbol);
      if (symbol) {
        mapOfSetsAdd(prettyToIds, symbol, exprRef);
      }
    }
  }

  return [idsToPretty, prettyToIds] as const;
}

function mapOfSetsAdd<MapKey, Value>(
  map: Map<MapKey, Set<Value>>,
  mapKey: MapKey,
  addedValue: Value
) {
  const set = map.get(mapKey) ?? new Set();

  map.set(mapKey, set);
  set.add(addedValue);
}
