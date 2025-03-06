import { notFound } from '@hapi/boom';
import type { JSONSchema7 as JSONSchema } from 'json-schema';
import tables from '@decipad/tables';
import { dataLakeId } from '../utils/dataLakeId';
import { getSourceTransform } from '../transforms/sources/getSourceTransform';
import { TargetColumn, TargetTable } from '../transforms/sources/types';

const columnToSchema = (column: TargetColumn): JSONSchema => {
  switch (column.type) {
    case 'timestamp':
      return {
        type: 'string',
        format: 'date-time',
      };
    default:
      return {
        type: column.type,
        description: column.description,
      };
  }
};

const tablesToSchema = (tableDescriptions: Array<TargetTable>): JSONSchema => {
  return {
    type: 'array',
    items: {
      type: 'object',
      properties: Object.fromEntries(
        tableDescriptions.map((t) => [
          t.tableName,
          {
            type: 'array',
            items: t.columns.map(columnToSchema),
          },
        ])
      ),
    },
  };
};

export const getWorkspaceSchema = async (
  workspaceId: string
): Promise<JSONSchema> => {
  const lake = await (
    await tables()
  ).datalakes.get({ id: dataLakeId(workspaceId) });
  if (!lake) {
    throw notFound('Workspace data lake not found');
  }
  const { connections = [] } = lake;

  return {
    type: 'object',
    properties: Object.fromEntries(
      connections.map((c) => {
        const sourceTransform = getSourceTransform(c.source);
        return [
          sourceTransform.realm,
          tablesToSchema(sourceTransform.targetTables),
        ];
      })
    ),
  };
};
