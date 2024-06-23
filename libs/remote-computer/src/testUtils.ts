import type { AST, Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { parseBlock } from '@decipad/language';
import type {
  IdentifiedBlock,
  IdentifiedError,
  Program,
  Computer,
  ProgramBlock,
} from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getIdentifierString } from '@decipad/language-utils';
import {
  astNode,
  buildType,
  deserializeType,
  serializeType,
  isTableResult,
} from '@decipad/remote-computer';
import { zip } from '@decipad/utils';

export const getDefinedSymbol = (
  stmt: AST.Statement,
  findIncrementalDefinitions = true
) => {
  switch (stmt.type) {
    case 'function-definition':
    case 'assign':
    case 'table':
    case 'categories':
      return getIdentifierString(stmt.args[0]);
    case 'matrix-assign':
      return findIncrementalDefinitions
        ? getIdentifierString(stmt.args[0])
        : null;
    case 'table-column-assign':
      return findIncrementalDefinitions
        ? getIdentifierString(stmt.args[0])
        : null;
    default:
      return null;
  }
};

export function getIdentifiedBlock(
  source: string,
  i = 0
): IdentifiedBlock | IdentifiedError {
  const id = `block-${i}`;
  const { solution: block, error } = parseBlock(source);

  if (error) {
    return {
      type: 'identified-error',
      id,
      errorKind: 'parse-error',
      source,
      error,
    };
  }

  block.id = id;

  const ret: IdentifiedBlock = { type: 'identified-block', id, block };

  if (block.args[0]?.type === 'table-column-assign') {
    ret.definesTableColumn = [
      block.args[0].args[0].args[0],
      block.args[0].args[1].args[0],
    ];
  } else {
    ret.definesVariable = getDefinedSymbol(block.args[0]) ?? undefined;
  }

  return ret;
}

export function getIdentifiedBlocks(...sources: string[]): Program {
  return sources.map((source, i) => getIdentifiedBlock(source, i));
}

export async function pushResultToComputer(
  computer: Computer,
  blockId: string,
  variableName: string,
  computerResult: Result.Result | undefined
) {
  if (
    computerResult?.type &&
    computerResult?.value != null &&
    typeof computerResult.value !== 'symbol'
  ) {
    if (isTableResult(computerResult)) {
      const { type, value } = computerResult as Result.Result<
        'table' | 'materialized-table'
      >;

      const externalDatas: Map<string, Result.Result> = new Map();
      const programBlocks: Map<string, ProgramBlock[]> = new Map([
        [
          blockId,
          // Table = {}
          [
            {
              type: 'identified-block',
              id: blockId,
              block: {
                id: blockId,
                type: 'block',
                args: [astNode('table', astNode('tabledef', variableName))],
              },
              definesVariable: variableName,
            },
          ],
        ],
      ]);

      for (const [index, [colName, colType]] of zip(
        type.columnNames,
        type.columnTypes
      ).entries()) {
        const dataRef = `${blockId}--${index}`;

        // Table.Column = {Data}
        programBlocks.set(dataRef, [
          {
            type: 'identified-block',
            id: dataRef,
            block: {
              id: dataRef,
              type: 'block',
              args: [
                astNode(
                  'table-column-assign',
                  astNode('tablepartialdef', variableName),
                  astNode('coldef', colName),
                  astNode('externalref', dataRef)
                ),
              ],
            },
            definesTableColumn: [variableName, colName],
          },
        ]);

        // the {Data} for the thing above
        externalDatas.set(dataRef, {
          type: serializeType(
            buildType.column(deserializeType(colType), variableName, index)
          ),
          value: value[index],
        });
      }

      await computer.pushComputeDelta({
        external: { upsert: externalDatas },
        extra: { upsert: programBlocks },
      });
    } else {
      await computer.pushComputeDelta({
        external: {
          upsert: {
            [blockId]: {
              type: serializeType(computerResult.type),
              value: computerResult.value,
            },
          },
        },
        extra: {
          upsert: new Map([
            [
              blockId,
              [
                {
                  type: 'identified-block',
                  id: blockId,
                  block: {
                    id: blockId,
                    type: 'block',
                    args: [
                      astNode(
                        'assign',
                        astNode('def', variableName),
                        astNode('externalref', blockId)
                      ),
                    ],
                  },
                },
              ],
            ],
          ]),
        },
      });
    }
  } else {
    await computer.pushComputeDelta({
      external: { remove: [blockId] },
      extra: { remove: [blockId] },
    });
  }
}
