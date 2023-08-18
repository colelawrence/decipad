import { AST, AutocompleteName, serializeType } from '@decipad/language';
import { getDefinedSymbol, getIdentifierString } from '../utils';
import { getExprRef, isExprRef } from '../exprRefs';
import type { Computer, Program } from '..';

export function* findNames(
  computer: Computer,
  program: Readonly<Program>,
  ignoreNames: Set<string>,
  inBlockId?: string
): Iterable<AutocompleteName> {
  for (const name of internalFindNames(
    computer,
    program,
    ignoreNames,
    inBlockId
  )) {
    if (!isExprRef(name.name)) {
      yield name;
    }
  }
}

/** Finds names accessible `inBlockId`. `isLocal` is adjusted if we're talking about local variables, and so is the column name if we're in a table (IE we don't need TableName.ColumnName) */
// eslint-disable-next-line complexity
function* internalFindNames(
  computer: Computer,
  program: Readonly<Program>,
  ignoreNames: Set<string>,
  inBlockId?: string
): Iterable<AutocompleteName> {
  const seenSymbols = new Set<string>();

  const translateName = (name: string): string => {
    const tableBlock = computer.latestVarNameToBlockMap.get(name);
    return (tableBlock && tableBlock.definesVariable) ?? name;
  };

  const [_ownTableName, ownVariableName] =
    computer.computationRealm.inferContext.stack.getNsNameFromId(
      getExprRef(inBlockId ?? '')
    ) ?? [];

  const ownTableName = _ownTableName && translateName(_ownTableName);

  const tableIdsByName = new Map<string, string>(
    program.flatMap((b) => {
      if (b.block?.args[0]?.type === 'table') {
        const tName = getIdentifierString(b.block.args[0].args[0]);
        return [[translateName(tName), b.id]];
      } else {
        return [];
      }
    })
  );

  for (const block of program) {
    for (const statement of block.block?.args ?? []) {
      const symbol = getSymbolOrColumn(statement);
      const type = statement.inferredType;

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
          name: translateName(statement.args[0].args[0]),
          blockId: block.id,
        };
      }

      if (statement.type === 'table') {
        const [tName, ...colItems] = statement.args;

        yield {
          kind: 'variable',
          type: serializeType(type),
          name: translateName(tName.args[0]),
          blockId: block.id,
        };

        for (const col of colItems) {
          const colType = col.inferredType;

          if (colType) {
            const tableName = translateName(
              getIdentifierString(statement.args[0])
            );
            const columnName = col.args[0].args[0];
            const isLocal = ownTableName === tableName;
            const name = isLocal ? columnName : `${tableName}.${columnName}`;
            yield {
              kind: 'column',
              type: serializeType(colType),
              name,
              inTable: tableName,
              isLocal,
              blockId: undefined, // don't want to get into smart refs with text code tables
              columnId: undefined, // unknown because in text form not all columns have ids
            };
          }
        }
      } else if (statement.type === 'table-column-assign') {
        const tableName = translateName(getIdentifierString(statement.args[0]));
        const columnName = statement.args[1].args[0];
        const isLocal = ownTableName === tableName;

        if (
          (ownTableName === tableName && ownVariableName === columnName) ||
          !tableIdsByName.has(tableName)
        ) {
          continue;
        }

        const name = isLocal ? columnName : `${tableName}.${columnName}`;

        yield {
          kind: 'column',
          type: serializeType(type),
          name,
          blockId: tableIdsByName.get(tableName),
          columnId: block.id,
          inTable: tableName,
          isLocal,
        };
      } else if (statement.type === 'function-definition') {
        yield {
          kind: 'function',
          type: serializeType(type),
          name: translateName(getIdentifierString(statement.args[0])),
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
