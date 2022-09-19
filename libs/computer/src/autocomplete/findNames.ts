import { AST, AutocompleteName, serializeType } from '@decipad/language';
import { getDefinedSymbol } from '../utils';
import { ComputationRealm } from '../computer/ComputationRealm';

export function* findNames(
  realm: ComputationRealm,
  program: AST.Block[],
  automaticallyGeneratedNames: Set<string>
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();
  const { nodeTypes } = realm.inferContext;
  // Our search stops at this statement
  for (const block of program) {
    for (const statement of block.args) {
      const symbol = getDefinedSymbol(statement);
      if (symbol) {
        if (seenSymbols.has(symbol)) continue;
        seenSymbols.add(symbol);
      }

      const identifierName = symbol?.split(':').pop();
      if (identifierName && automaticallyGeneratedNames.has(identifierName)) {
        continue;
      }

      const type = nodeTypes.get(statement);

      if (statement.type === 'assign' && type) {
        yield {
          kind: 'variable',
          type: serializeType(type),
          name: statement.args[0].args[0],
          blockId: block.id,
        };

        if (statement.args[1].type === 'table') {
          for (const col of statement.args[1].args) {
            const colType = nodeTypes.get(col);
            if (colType) {
              yield {
                kind: 'column',
                type: serializeType(colType),
                name: `${statement.args[0].args[0]}.${col.args[0].args[0]}`,
              };
            }
          }
        }
      }

      if (statement.type === 'function-definition' && type) {
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
