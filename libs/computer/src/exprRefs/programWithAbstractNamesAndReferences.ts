import { isAssignment } from '@decipad/language';
import uniq from 'lodash.uniq';
import {
  getExprRef,
  type IdentifiedBlock,
  type Program,
  type ProgramBlock,
} from '..';
import { getIdentifierString } from '../utils';
import { statementWithAbstractRefs } from './statementWithAbstractRefs';
import {
  BlockDependentsMap,
  ReadOnlyVarNameToBlockMap,
} from '../internalTypes';
import { maybeReplaceIdentifierWith } from './maybeReplaceIdentifierWith';
import { programToVarNameToBlockMap } from './programToVarNameToBlockMap';

const identifiedBlockWithAbstractNamesAndReferences = (
  varNameToBlockMap: ReadOnlyVarNameToBlockMap,
  blockDependents: BlockDependentsMap,
  tableToColumnsMap: ReadonlyMap<string, Set<string>>
) => {
  const toUserlandRef = (ref: string) => {
    const block = varNameToBlockMap.get(ref);
    if (block) {
      return block.definesVariable ?? block.definesTableColumn?.[1] ?? ref;
    }
    return ref;
  };

  const maybeReplaceIdentifier = maybeReplaceIdentifierWith(varNameToBlockMap);

  const addDependent = (blockId: string, dependent: string) => {
    const dependents = blockDependents.get(blockId) ?? [];
    dependents.push(dependent);
    blockDependents.set(blockId, uniq(dependents));
  };

  return (block: IdentifiedBlock): IdentifiedBlock => {
    if (block.block.args.length !== 1) {
      throw new Error(
        `Unexpected block args length: ${block.block.args.length}. Expected 1.`
      );
    }
    const [statement] = block.block.args;
    const definesExprRef = getExprRef(block.id);

    if (statement.type === 'table-column-assign') {
      const tableName = toUserlandRef(getIdentifierString(statement.args[0]));
      const tableBlock = varNameToBlockMap.get(tableName);
      if (tableBlock) {
        addDependent(tableBlock.id, block.id);
      }
    }

    // replace assignments with expression ref assignments
    if (isAssignment(statement)) {
      maybeReplaceIdentifier(statement.args[0]);
    } else if (statement.type !== 'categories') {
      // turn into assignment
      block.block.args[0] = {
        ...statement,
        type: 'assign',
        args: [
          {
            type: 'def',
            args: [definesExprRef],
          },
          statement,
        ],
      };
    }

    const tableColumns =
      statement.type === 'table-column-assign' && block.definesTableColumn
        ? tableToColumnsMap.get(block.definesTableColumn[0])
        : undefined;

    const [, dependencies] = statementWithAbstractRefs(
      statement,
      varNameToBlockMap,
      toUserlandRef,
      maybeReplaceIdentifier,
      tableColumns
    );
    for (const dep of dependencies) {
      addDependent(dep, block.id);
    }
    return block;
  };
};

const blockWithAbstractNamesAndReferences = (
  varNameToBlockMap: ReadOnlyVarNameToBlockMap,
  blockDependencies: BlockDependentsMap,
  tableColumns: Map<string, Set<string>>
) => {
  const toIdentifiedBlockWithAbstractNamesAndReferences =
    identifiedBlockWithAbstractNamesAndReferences(
      varNameToBlockMap,
      blockDependencies,
      tableColumns
    );
  return (block: ProgramBlock) => {
    if (block.type === 'identified-error') {
      return block;
    }
    return toIdentifiedBlockWithAbstractNamesAndReferences(block);
  };
};

interface ProgramWithAbstractNamesAndReferencesResult {
  program: Program;
  varNameToBlockMap: ReadOnlyVarNameToBlockMap;
  blockDependents: BlockDependentsMap;
}

export const programWithAbstractNamesAndReferences = (
  program: Program
): ProgramWithAbstractNamesAndReferencesResult => {
  const blockDependents = new Map<string, string[]>();
  const { varNameToBlockMap, tableToColumnsMap } =
    programToVarNameToBlockMap(program);

  return {
    // we have to map the program twice because some identifiers on varNameToBlockMap
    // will not have been pre-populated on the first pass.
    // So, first pass will populate the references, the second will make sure
    // all the references are definitely switched to abstract references.
    program: program.map(
      blockWithAbstractNamesAndReferences(
        varNameToBlockMap,
        blockDependents,
        tableToColumnsMap
      )
    ),
    varNameToBlockMap,
    blockDependents,
  };
};
