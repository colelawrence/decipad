import { Computer, ProgramBlock } from '@decipad/computer-interfaces';
import { AST, Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { astNode } from '@decipad/language-utils';
import { zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  serializeType,
  deserializeType,
  buildType,
} from '@decipad/language-types';

type BlockId = string;

// todo util file
export const getColumnId = (tableId: string, uniqueColumnName: string) =>
  `${tableId}--${uniqueColumnName}`;

export async function pushExtraData(
  computer: Computer,
  blockId: string,
  variableName: string,
  columnIds: string[],
  columnNames: string[],
  filterExpression?: AST.Expression
): Promise<void> {
  const programBlocks: ProgramBlock[] = [];

  const tableNamespaceBlock: ProgramBlock = {
    type: 'identified-block',
    id: blockId,
    block: {
      id: blockId,
      type: 'block',
      args: [astNode('table', astNode('tabledef', variableName))],
    },
    definesVariable: variableName,
    isArtificial: true,
  };

  programBlocks.push(tableNamespaceBlock);

  for (const [originalColumnId, columnName] of zip(
    columnIds,
    columnNames
  ).values()) {
    const columnId = getColumnId(blockId, originalColumnId);

    const columnProgramBlock: ProgramBlock = {
      type: 'identified-block',
      id: columnId,
      block: {
        id: columnId,
        type: 'block',
        args: [
          astNode(
            'table-column-assign',
            astNode('tablepartialdef', variableName),
            astNode('coldef', columnName),
            filterExpression
              ? astNode(
                  'function-call',
                  astNode('funcref', 'filter'),
                  astNode(
                    'argument-list',
                    astNode('externalref', columnId),
                    filterExpression
                  )
                )
              : astNode('externalref', columnId)
          ),
        ],
      },
      definesTableColumn: [variableName, columnName],
      isArtificial: true,
      artificiallyDerivedFrom: [blockId],
    };

    programBlocks.push(columnProgramBlock);
  }

  return computer.pushComputeDelta({
    program: { upsert: programBlocks },
  });
}

export async function pushExternalData(
  computer: Computer,
  blockId: string,
  variableName: string,
  computerResult: Result.Result,
  columnNameToId: Record<string, string> = {}
): Promise<void> {
  const externalDataMap = new Map<BlockId, Result.Result>();

  externalDataMap.set(blockId, computerResult);

  if (computerResult.type.kind === 'table') {
    for (const [index, [columnName, columnType]] of zip(
      computerResult.type.columnNames,
      computerResult.type.columnTypes
    ).entries()) {
      const columnId = getColumnId(
        blockId,
        columnNameToId[columnName] ?? columnName
      );

      externalDataMap.set(columnId, {
        type: serializeType(
          buildType.column(deserializeType(columnType), variableName, index)
        ),
        value: (computerResult.value as Result.Result<'table'>['value'])[index],
        meta: computerResult.meta,
      });
    }
  }

  return computer.pushComputeDelta({
    external: { upsert: externalDataMap },
  });
}

export async function pushDeleteExternalData(
  computer: Computer,
  blockId: string,
  columnNameToId: Record<string, string | undefined> = {}
): Promise<void> {
  const externalDataIds: string[] = [blockId];

  const computerResult = computer.getBlockIdResult(blockId);
  if (computerResult == null) {
    return;
  }

  if (computerResult.type === 'identified-error') {
    return computer.pushComputeDelta({ program: { remove: [blockId] } });
  }

  const { result } = computerResult;

  if (result.type.kind === 'table') {
    for (const columnName of result.type.columnNames) {
      const columnId = getColumnId(
        blockId,
        columnNameToId[columnName] ?? columnName
      );

      externalDataIds.push(columnId);
    }
  }

  return computer.pushComputeDelta({
    external: { remove: externalDataIds },
    program: { remove: externalDataIds },
  });
}
