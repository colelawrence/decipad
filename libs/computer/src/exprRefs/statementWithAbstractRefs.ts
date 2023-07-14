import { walkAst } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { type AST } from '..';
import { getIdentifierString } from '../utils';
import { ReadOnlyVarNameToBlockMap } from '../internalTypes';
import { maybeReplaceIdentifierWith } from './maybeReplaceIdentifierWith';
import { isExprRef } from '.';

export const statementWithAbstractRefs = <T extends AST.Statement>(
  stmt: T,
  varNameToBlockMap: ReadOnlyVarNameToBlockMap,
  toUserlandRef: (ref: string) => string = (ref: string) => {
    const block = varNameToBlockMap.get(ref);
    if (block) {
      return block.definesVariable ?? block.definesTableColumn?.[1] ?? ref;
    }
    return ref;
  },
  maybeReplaceIdentifier: (
    identifier: AST.Identifier
  ) => string | false = maybeReplaceIdentifierWith(varNameToBlockMap),
  localIdentifiers = new Set<string>()
): [T, string[]] => {
  const blockDependencies: string[] = [];

  const processNode = (node: AST.Node) => {
    switch (node.type) {
      case 'funcref': {
        const refName = toUserlandRef(getIdentifierString(node));
        const definedInBlock = varNameToBlockMap.get(refName);
        if (definedInBlock) {
          blockDependencies.push(definedInBlock.id);
        }
        maybeReplaceIdentifier(node);
        break;
      }
      case 'generic-identifier':
      case 'ref': {
        const originalRef = getIdentifierString(node);
        const refName = toUserlandRef(originalRef);
        const definedInBlock =
          varNameToBlockMap.get(originalRef) ?? varNameToBlockMap.get(refName);
        if (definedInBlock) {
          blockDependencies.push(definedInBlock.id);
          if (definedInBlock.definesVariable && !node.previousVarName) {
            node.previousVarName = definedInBlock.definesVariable;
          }
        } else if (node.previousVarName) {
          node.args[0] = node.previousVarName;
        }
        if (
          definedInBlock?.definesTableColumn &&
          isExprRef(originalRef) &&
          localIdentifiers.has(refName)
        ) {
          node.args[0] = refName;
          node.isMissing = false;
        } else if (!localIdentifiers.has(refName)) {
          if (isExprRef(refName)) {
            node.isMissing = true;
          } else {
            node.isMissing = false;
          }
          const replaced = maybeReplaceIdentifier(node);
          if (replaced && !node.previousVarName) {
            node.previousVarName = replaced;
          }
        } else {
          node.isMissing = false;
        }
        break;
      }
      case 'property-access': {
        const [expr, colRef] = node.args;
        const colName = getIdentifierString(colRef);
        if (isExprRef(colName)) {
          // we want to convert column access expr refs to the column name
          const block = varNameToBlockMap.get(colName);
          if (block && block.definesTableColumn) {
            colRef.args[0] = getDefined(block.definesTableColumn.at(1));
          }
        }
        if (expr.type === 'ref') {
          const tableName = toUserlandRef(getIdentifierString(expr));
          const tableBlock = varNameToBlockMap.get(tableName);
          if (tableBlock) {
            blockDependencies.push(tableBlock.id);
          }
          const colRefName = [expr, colRef].map(getIdentifierString).join('.');
          const colBlock = varNameToBlockMap.get(colRefName);
          if (colBlock) {
            blockDependencies.push(colBlock.id);
          }
          const colFullRef = [expr, colRef].map(getIdentifierString).join('.');
          const colRefBlock = varNameToBlockMap.get(colFullRef);
          if (colRefBlock) {
            blockDependencies.push(colRefBlock.id);
          }
        }
      }
    }
  };

  walkAst(stmt, processNode);

  return [stmt, blockDependencies];
};
