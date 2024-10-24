import { Computer, ProgramBlock } from '@decipad/computer-interfaces';
// eslint-disable-next-line no-restricted-imports
import { astNode } from '@decipad/language-utils';
import { getColumnId } from './pushExternalData';

type Options =
  | {
      type: 'table';
      columnNameToIds: Record<string, string | undefined>;
      columnsToHide: string[];
    }
  | {
      type: 'column';
      originalColumnName: string;
      tableName: string;
      tableId: string;
    };

export async function pushResultNameChange(
  computer: Computer,
  blockId: string,
  newVarName: string,
  options: Options
): Promise<void> {
  const result = computer.getBlockIdResult(blockId);
  if (result == null) {
    return;
  }

  if (result.type !== 'computer-result') {
    // What should we even do here?
    throw new Error('Cannot rename errored result');
  }

  if (result.result.type.kind !== 'table') {
    // Don't rename single variable values, it's easier to just
    // push them again.
    throw new Error('Currently, we only support renaming on table level.');
  }

  const renamedBlocks: ProgramBlock[] = [];

  switch (options.type) {
    case 'table': {
      // TODO: need to change all the columns too?

      if (computer.getBlockIdResult(blockId) == null) {
        break;
      }

      const tableBlock: ProgramBlock = {
        type: 'identified-block',
        id: blockId,
        block: {
          id: blockId,
          type: 'block',
          args: [astNode('table', astNode('tabledef', newVarName))],
        },
        definesVariable: newVarName,
        isArtificial: true,
      };

      renamedBlocks.push(tableBlock);

      for (const [
        index,
        columnName,
      ] of result.result.type.columnNames.entries()) {
        if (options.columnsToHide.includes(columnName)) {
          continue;
        }

        const columnId = getColumnId(
          blockId,
          options.columnNameToIds[columnName] ?? columnName
        );

        if (computer.getBlockIdResult(columnId) == null) {
          continue;
        }

        const columnBlock: ProgramBlock = {
          type: 'identified-block',
          id: columnId,
          block: {
            id: columnId,
            type: 'block',
            args: [
              astNode(
                'table-column-assign',
                astNode('tablepartialdef', newVarName),
                astNode('coldef', columnName),
                astNode('externalref', columnId),
                index
              ),
            ],
          },
          definesVariable: newVarName,
          isArtificial: true,
          artificiallyDerivedFrom: [blockId],
        };

        renamedBlocks.push(columnBlock);
      }

      break;
    }
    case 'column': {
      const columnId = getColumnId(options.tableId, options.originalColumnName);

      const columnResult = computer.getBlockIdResult(columnId);

      if (columnResult == null) {
        break;
      }

      if (columnResult.type === 'identified-error') {
        throw new Error('stub');
      }

      const columnType = columnResult.result.type;

      if (
        columnType.kind !== 'column' &&
        columnType.kind !== 'materialized-column'
      ) {
        throw new Error('not a table');
      }

      const columnBlock: ProgramBlock = {
        type: 'identified-block',
        id: columnId,
        block: {
          id: columnId,
          type: 'block',
          args: [
            astNode(
              'table-column-assign',
              astNode('tablepartialdef', options.tableName),
              astNode('coldef', newVarName),
              astNode('externalref', columnId),
              columnType.atParentIndex ?? undefined
            ),
          ],
        },
        definesTableColumn: [options.tableName, newVarName],
        isArtificial: true,
        artificiallyDerivedFrom: [blockId],
      };

      renamedBlocks.push(columnBlock);
      break;
    }
  }

  await computer.pushComputeDelta({ program: { upsert: renamedBlocks } });
}
