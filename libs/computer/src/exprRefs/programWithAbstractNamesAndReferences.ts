import { AST, isAssignment } from '@decipad/language';
import uniq from 'lodash.uniq';
import {
  getExprRef,
  isExprRef,
  type IdentifiedBlock,
  type Program,
  type ProgramBlock,
} from '..';
import { getIdentifierString } from '../utils';
import { statementWithAbstractRefs } from './statementWithAbstractRefs';
import { BlockDependentsMap, VarNameToBlockMap } from '../internalTypes';
import {
  ColDef,
  TablePartialDef,
} from '../../../language/src/parser/ast-types';
import { maybeReplaceIdentifierWith } from './maybeReplaceIdentifierWith';

const identifiedBlockWithAbstractNamesAndReferences = (
  varNameToBlockMap: VarNameToBlockMap,
  blockDependents: BlockDependentsMap,
  tableToColumnsMap: Map<string, Set<string>>
) => {
  const toUserlandRef = (ref: string) => {
    const block = varNameToBlockMap.get(ref);
    if (block) {
      return block.definesVariable ?? block.definesTableColumn?.[1] ?? ref;
    }
    return ref;
  };

  const getDefinedName = (statement: AST.GenericAssignment): string => {
    if (statement.type === 'table-column-assign') {
      return (statement.args.slice(0, 2) as [TablePartialDef, ColDef])
        .map(getIdentifierString)
        .map(toUserlandRef)
        .join('.');
    }
    const [def] = statement.args;
    return toUserlandRef(getIdentifierString(def));
  };

  const maybeReplaceIdentifier = maybeReplaceIdentifierWith(varNameToBlockMap);

  const addDependent = (blockId: string, dependent: string) => {
    const dependents = blockDependents.get(blockId) ?? [];
    dependents.push(dependent);
    blockDependents.set(blockId, uniq(dependents));
  };

  const addTableColumn = (tableName?: string, columnName?: string) => {
    if (tableName && columnName) {
      const tableColumns =
        tableToColumnsMap.get(tableName) ?? new Set<string>();
      tableColumns.add(columnName);
      tableToColumnsMap.set(tableName, tableColumns);
    }
  };

  return (block: IdentifiedBlock): IdentifiedBlock => {
    if (block.block.args.length !== 1) {
      throw new Error(
        `Unexpected block args length: ${block.block.args.length}. Expected 1.`
      );
    }
    const [statement] = block.block.args;
    const definesExprRef = getExprRef(block.id);

    // fill `definesVariable` and `definesTableColumn` in block
    if (!block.definesVariable && statement.type !== 'table-column-assign') {
      if (isAssignment(statement)) {
        block.definesVariable = toUserlandRef(
          getIdentifierString(statement.args[0])
        );
      } else {
        block.definesVariable = definesExprRef;
      }
    }
    if (statement.type === 'table-column-assign') {
      block.definesTableColumn = [
        toUserlandRef(getIdentifierString(statement.args[0])),
        toUserlandRef(getIdentifierString(statement.args[1])),
      ];

      const tableName = toUserlandRef(getIdentifierString(statement.args[0]));
      const tableBlock = varNameToBlockMap.get(tableName);
      if (tableBlock) {
        addDependent(tableBlock.id, block.id);
      }
      addTableColumn(...block.definesTableColumn);
    }

    // replace assignments with expression ref assignments
    if (isAssignment(statement)) {
      const definesName = getDefinedName(statement);
      if (!isExprRef(definesName)) {
        block.block.hasDuplicateName = varNameToBlockMap.has(definesName)
          ? definesName
          : undefined;
      }
      varNameToBlockMap.set(definesName, block);
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

    varNameToBlockMap.set(definesExprRef, block);
    if (block.definesVariable) {
      varNameToBlockMap.set(block.definesVariable, block);
    }
    if (block.definesTableColumn) {
      varNameToBlockMap.set(block.definesTableColumn.join('.'), block);
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
  varNameToBlockMap: VarNameToBlockMap,
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
  varNameToBlockMap: VarNameToBlockMap;
  blockDependents: BlockDependentsMap;
}

export const programWithAbstractNamesAndReferences = (
  program: Program
): ProgramWithAbstractNamesAndReferencesResult => {
  const varNameToBlockMap = new Map<string, ProgramBlock>();
  const blockDependents = new Map<string, string[]>();
  const tableToColumnsMap = new Map<string, Set<string>>();
  return {
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
