import { AST, AutocompleteName, serializeType } from '@decipad/language';
import { getDefinedSymbol } from '../utils';
import { ComputationRealm } from '../computer/ComputationRealm';

export function* findNames(
  realm: ComputationRealm,
  program: AST.Block[],
  ignoreNames: Set<string>,
  inSymbol?: string
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();
  const { nodeTypes } = realm.inferContext;
  // Our search stops at this statement

  for (const block of program) {
    for (const statement of block.args) {
      const symbol = getSymbolOrColumn(statement);
      if (!symbol || seenSymbols.has(symbol) || ignoreNames.has(symbol)) {
        continue;
      }

      const type = nodeTypes.get(statement);
      if (!type) {
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
            const isLocal = inSymbol != null && inSymbol === tableName;
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
        const isLocal = inSymbol != null && inSymbol === tableName;
        const name = isLocal ? columnName : `${tableName}.${columnName}`;
        yield {
          kind: 'column',
          type: serializeType(type),
          name,
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
