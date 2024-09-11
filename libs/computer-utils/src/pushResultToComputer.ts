import { Computer, ProgramBlock } from '@decipad/computer-interfaces';
import { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { astNode } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import {
  buildType,
  deserializeType,
  serializeType,
} from '@decipad/language-types';
import { zip } from '@decipad/utils';
import { isTableResult } from './isTableResult';
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
  if (computerResult?.type && computerResult?.value != null) {
    if (isTableResult(computerResult)) {
      const { type, value, meta } = computerResult as Result.Result<
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
          meta,
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
