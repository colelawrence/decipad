import { isAssignment } from '@decipad/language';
import { type AST, getExprRef } from '..';
import { VarNameToBlockMap } from '../internalTypes';
import { Program } from '../types';
import { getIdentifierString } from '../utils';

interface ProgramToVarNameToBlockMapResult {
  varNameToBlockMap: VarNameToBlockMap;
  tableToColumnsMap: Map<string, Set<string>>;
}

// eslint-disable-next-line complexity
export const programToVarNameToBlockMap = (
  program: Program
): ProgramToVarNameToBlockMapResult => {
  const varNameToBlockMap: VarNameToBlockMap = new Map();
  const tableToColumnsMap = new Map<string, Set<string>>();

  const toUserlandRef = (ref: string) => {
    const block = varNameToBlockMap.get(ref);
    if (block) {
      return block.definesVariable ?? block.definesTableColumn?.[1] ?? ref;
    }
    return ref;
  };

  const addTableColumn = (
    tableName: string,
    columnName: string,
    block: AST.Block
  ) => {
    const tableColumns = tableToColumnsMap.get(tableName) ?? new Set<string>();
    if (tableColumns.has(columnName)) {
      block.hasDuplicateName = columnName;
    } else {
      tableColumns.add(columnName);
      tableToColumnsMap.set(tableName, tableColumns);
    }
  };

  const getDefinedName = (statement: AST.GenericAssignment): string => {
    if (statement.type === 'table-column-assign') {
      return (statement.args.slice(0, 2) as [AST.TablePartialDef, AST.ColDef])
        .map(getIdentifierString)
        .map(toUserlandRef)
        .join('.');
    }
    const [def] = statement.args;
    return toUserlandRef(getIdentifierString(def));
  };

  for (const block of program) {
    if (block.block?.type !== 'block') {
      continue;
    }
    const [statement] = block.block.args;
    if (statement == null) {
      continue;
    }
    let identifier: string | undefined;
    if (statement.type === 'table-column-assign') {
      const [tableName, columnName] = (
        statement.args.slice(0, 2) as [AST.TablePartialDef, AST.ColDef]
      ).map(getIdentifierString) as [string, string];
      if (!block.definesTableColumn) {
        block.definesTableColumn = [tableName, columnName];
      }

      addTableColumn(...block.definesTableColumn, block.block);
      identifier = block.definesTableColumn.join('.');
    } else if (isAssignment(statement)) {
      if (block.definesVariable) {
        identifier = block.definesVariable;
      } else {
        identifier = getDefinedName(statement);
        block.definesVariable = identifier;
      }
    }
    if (identifier) {
      if (varNameToBlockMap.has(identifier)) {
        block.block.hasDuplicateName = identifier;
      }
      varNameToBlockMap.set(identifier, block);
    }
    const exprRef = getExprRef(block.id);
    if (!block.definesVariable && !block.definesTableColumn) {
      block.definesVariable = exprRef;
    }
    varNameToBlockMap.set(exprRef, block);
  }

  // console.log('varNameToBlockMap', varNameToBlockMap);
  return { varNameToBlockMap, tableToColumnsMap };
};
