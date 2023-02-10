import { AST, AutocompleteName, serializeType } from '@decipad/language';
import { getDefinedSymbol } from '../utils';
import { ComputationRealm } from '../computer/ComputationRealm';
import { getExprRef } from '../exprRefs';

/** Finds names accessible `inBlockId`. `isLocal` is adjusted if we're talking about local variables, and so is the column name if we're in a table (IE we don't need TableName.ColumnName) */
export function* findNames(
  realm: ComputationRealm,
  program: AST.Block[],
  ignoreNames: Set<string>,
  inBlockId?: string
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();
  const { nodeTypes } = realm.inferContext;

  const [ownTableName, ownVariableName] =
    realm.inferContext.stack.getNsNameFromId(getExprRef(inBlockId ?? '')) ?? [];

  for (const block of program) {
    for (const statement of block.args) {
      const symbol = getSymbolOrColumn(statement);
      const type = nodeTypes.get(statement);

      if (
        !symbol ||
        seenSymbols.has(symbol) ||
        ignoreNames.has(symbol) ||
        !type ||
        block.id === inBlockId
      ) {
        continue;
      }

      if (statement.type === 'assign') {
        yield {
          kind: 'variable',
          type: serializeType(type),
          name: statement.args[0].args[0],
          blockId: block.id,
        };
      }

      if (statement.type === 'table') {
        const [tName, ...colItems] = statement.args;

        yield {
          kind: 'variable',
          type: serializeType(type),
          name: tName.args[0],
          blockId: block.id,
        };

        for (const col of colItems) {
          const colType = nodeTypes.get(col);

          if (colType) {
            const tableName = statement.args[0].args[0];
            const columnName = col.args[0].args[0];
            const isLocal = ownTableName === tableName;
            const name = isLocal ? columnName : `${tableName}.${columnName}`;
            yield {
              kind: 'column',
              type: serializeType(colType),
              name,
              isLocal,
            };
          }
        }
      }

      if (statement.type === 'table-column-assign') {
        const tableName = statement.args[0].args[0];
        const columnName = statement.args[1].args[0];
        const isLocal = ownTableName === tableName;

        if (ownTableName === tableName && ownVariableName === columnName) {
          continue;
        }

        const name = isLocal ? columnName : `${tableName}.${columnName}`;

        yield {
          kind: 'column',
          type: serializeType(type),
          name,
          blockId: block.id,
          isLocal,
        };
      }

      if (statement.type === 'function-definition') {
        yield {
          kind: 'function',
          type: serializeType(type),
          name: statement.args[0].args[0],
          blockId: block.id,
        };
      }
    }
  }
}

const getSymbolOrColumn = (stat: AST.Statement) => {
  const symbol = getDefinedSymbol(stat);

  if (symbol && stat.type === 'table-column-assign') {
    return `${symbol}.${stat.args[1].args[0]}`;
  } else {
    return symbol;
  }
};
