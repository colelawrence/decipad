import { AST, AutocompleteName, serializeType } from '@decipad/language';
import { getDefinedSymbol } from '../utils';
import { ComputationRealm } from '../computer/ComputationRealm';

const sortAutocompleteNames =
  (takesPrecedencePrefix: string) =>
  (a: AutocompleteName, b: AutocompleteName): number => {
    const aStarts = (a.name.startsWith(takesPrecedencePrefix) && 1) || 0;
    const bStarts = (b.name.startsWith(takesPrecedencePrefix) && 1) || 0;
    return bStarts - aStarts;
  };

export function* findNames(
  realm: ComputationRealm,
  program: AST.Block[],
  ignoreNames: Set<string>,
  inSymbol?: string
): Iterable<AutocompleteName> {
  const prefix = inSymbol && `${inSymbol}.`;
  const names = inSymbol
    ? Array.from(findGlobalNames(realm, program, ignoreNames)).sort(
        sortAutocompleteNames(inSymbol)
      )
    : findGlobalNames(realm, program, ignoreNames);
  for (const name of names) {
    if (prefix && name.name.startsWith(prefix)) {
      yield { ...name, name: name.name.slice(prefix.length) };
    } else {
      yield name;
    }
  }
}

function* findGlobalNames(
  realm: ComputationRealm,
  program: AST.Block[],
  ignoreNames: Set<string>
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

      if (statement.type === 'table-column-assign') {
        yield {
          kind: 'column',
          type: serializeType(type),
          name: `${statement.args[0].args[0]}.${statement.args[1].args[0]}`,
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
  let symbol = getDefinedSymbol(stat)?.split(':', 2).pop();

  if (symbol && stat.type === 'table-column-assign') {
    symbol += `.${stat.args[1].args[0]}`;
  }

  return symbol;
};
