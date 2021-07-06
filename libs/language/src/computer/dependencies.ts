import { IComputationRealm } from './ComputationRealm';
import { ValueLocation } from './types';
import {
  iterProgram,
  findSymbolsUsed,
  getDefinedSymbol,
  getStatement,
  stringifyLoc,
} from './utils';

export function getDependencies(
  program: AST.Block[],
  targets: ValueLocation[],
  cache?: IComputationRealm
) {
  const foundDependencies = targets.filter((loc) => !cache?.hasLoc(loc));

  // Map defined names (var:A, fn:dothing) to where they're defined
  const definitionIndex = new Map<string, ValueLocation>();
  iterProgram(program, (stmt, loc) => {
    const definedSymbol = getDefinedSymbol(stmt);

    if (definedSymbol != null) {
      definitionIndex.set(definedSymbol, loc);
    }
  });

  function findDefinitionStatement(defName: string) {
    const loc = definitionIndex.get(defName);
    // Don't go to the same place twice
    definitionIndex.delete(defName);

    return loc;
  }

  // Recursively find dependencies of a single target
  function findDependencies(target: ValueLocation | null) {
    if (target == null || cache?.hasLoc(target)) return;

    const stmt = getStatement(program, target);
    const definedSymbol = getDefinedSymbol(stmt);

    if (definedSymbol != null && cache?.has(definedSymbol)) return;

    for (const sym of findSymbolsUsed(stmt)) {
      if (cache?.has(sym)) continue;

      const definedAt = findDefinitionStatement(sym);

      if (definedAt != null) {
        foundDependencies.push(definedAt);
        findDependencies(definedAt);
      }
    }
  }

  // The targets the user is subscribed to are our roots in this dep lookup
  for (const target of targets) {
    findDependencies(target);
  }

  return foundDependencies;
}

const blockLocs = (block: AST.Block): ValueLocation[] =>
  block.args.map((_stmt, i) => [block.id, i]);

export const getAllBlockLocations = (
  blocks: AST.Block[],
  blockIds: string[]
): ValueLocation[] =>
  blocks.flatMap((block) =>
    blockIds.includes(block.id) ? blockLocs(block) : []
  );

const sortAndDeduplicateLocations = (
  program: AST.Block[],
  unsortedLocations: ValueLocation[]
) => {
  const locSet = new Set(unsortedLocations.map(stringifyLoc));
  const plan: ValueLocation[] = [];

  // Ensure the evaluation is ordered by statement
  iterProgram(program, (_stmt, loc) => {
    if (locSet.has(stringifyLoc(loc))) {
      plan.push(loc);
    }
  });

  return plan;
};

// Add this to the eval plan to show the computer the places variables are reassigned (so it can error)
const findReassignmentLocations = (program: AST.Block[]) => {
  const reassignments: ValueLocation[] = [];
  const definedSymbols = new Map<string, ValueLocation>();

  iterProgram(program, (stmt, loc) => {
    const sym = getDefinedSymbol(stmt);

    if (sym != null) {
      const originalAssignment = definedSymbols.get(sym);

      if (originalAssignment != null) {
        reassignments.push(originalAssignment);
        reassignments.push(loc);
      } else {
        definedSymbols.set(sym, loc);
      }
    }
  });

  return sortAndDeduplicateLocations(program, reassignments);
};

export const getEvaluationPlan = (
  program: AST.Block[],
  subscriptions: string[],
  realm: IComputationRealm
) => {
  const subbedLocations = getAllBlockLocations(program, subscriptions);

  return sortAndDeduplicateLocations(program, [
    ...getDependencies(program, subbedLocations, realm),
    ...findReassignmentLocations(program),
  ]);
};

export const getDependents = (program: AST.Block[], blockIds: string[]) => {
  const dependents: ValueLocation[] = [];

  const dependentSymbols = new Set(
    getAllBlockLocations(program, blockIds).flatMap((loc) => {
      const sym = getDefinedSymbol(getStatement(program, loc));

      if (sym != null) return [sym];
      return [];
    })
  );

  iterProgram(program, (stmt, loc) => {
    if (blockIds.includes(loc[0])) {
      return;
    }

    const usedSymbols = findSymbolsUsed(stmt);

    if (usedSymbols.some((sym) => dependentSymbols.has(sym))) {
      // Mark as dep
      dependents.push(loc);

      // Place the symbol if any in the dependency bag so its uses are identified
      const sym = getDefinedSymbol(getStatement(program, loc));
      if (sym != null) {
        dependentSymbols.add(sym);
      }
    }
  });

  return dependents;
};
