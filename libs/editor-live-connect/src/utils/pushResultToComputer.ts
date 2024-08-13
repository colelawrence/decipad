import { Computer, ProgramBlock } from '@decipad/computer-interfaces';
import {
  astNode,
  buildType,
  deserializeType,
  isTableResult,
  Result,
  serializeType,
} from '@decipad/remote-computer';
import { zip } from '@decipad/utils';
/**
 * Inject a table into the computer so the rest of the notebook can read isTableResult
 * Pass `computerResult` as `undefined` if you want to erase the result.
 */
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
              isArtificial: true,
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
            isArtificial: true,
            artificiallyDerivedFrom: [blockId],
          },
        ]);

        // the {Data} for the thing above
        externalDatas.set(dataRef, {
          type: serializeType(
            buildType.column(deserializeType(colType), variableName, index)
          ),
          value: value[index],
          meta: computerResult.meta,
        });
      }

      await computer.pushComputeDelta({
        external: { upsert: externalDatas },
        extra: { upsert: programBlocks },
      });
    } else {
      const externalRef = `${blockId}-external`;
      await computer.pushComputeDelta({
        external: {
          upsert: {
            [externalRef]: {
              type: serializeType(computerResult.type),
              value: computerResult.value,
              meta: computerResult.meta,
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
                        astNode('externalref', externalRef)
                      ),
                    ],
                  },
                  isArtificial: true,
                },
              ],
            ],
          ]),
        },
      });
    }
  } else {
    await computer.pushComputeDelta({
      external: { remove: [`${blockId}-external`] },
      extra: { remove: [blockId] },
    });
  }
}
