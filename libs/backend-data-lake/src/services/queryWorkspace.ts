import { badData, badRequest, notFound } from '@hapi/boom';
import { getDataLakeConnection } from '../utils/getDataLakeConnection';
import { prepareForJSON, rowsToColumns } from '@decipad/backend-external-db';
import { getDataLake } from './getDataLake';
import { getSourceTransform } from '../transforms/sources/getSourceTransform';
import { once } from '@decipad/utils';
import { z } from 'zod';
import { getBigQueryProjectId } from '../utils/getBigQueryProjectId';
import { dataLakeId } from '../utils/dataLakeId';
import { DataLakeDataConnection } from '@decipad/backendtypes';

const createQueryRequestBodyParser = once(() =>
  z.object({
    time: z.number(),
    query: z.string(),
  })
);

const MAX_COL_SIZE = 10000;

const prepareQuery = (
  workspaceId: string,
  connections: DataLakeDataConnection[],
  time: Date,
  query: string
): string => {
  /*
    When you create a datalake query block you define a point in time (not sure if you noticed it).
    The way that we import the raw data (for every provider), is incremental.
    Instead of overwriting old data with new data, we instead create a new record with the changes.
    Airbyte keeps a record of when the thing was created, which means that we now have a point in time which we can use to create a preamble to every query: https://github.com/decipad/decipad/blob/3198b44eefef723c63d1fac10113c0dc7346c92e/libs/backend-data-lake/src/services/queryWorkspace.ts#L33
    This preamble allows you to
    a) use a local table name like "timetracking_users" instead of the full table name
    b) only uses a specific version of each record in that point in time
  */
  if (!connections.length) {
    return query;
  }
  const bigQueryDataSetId = `${getBigQueryProjectId()}.${dataLakeId(
    workspaceId
  )}`;
  const preamble = `WITH\n${connections.map((conn) => {
    const localTableNamePrefix = `${bigQueryDataSetId}.${conn.realm}_`;
    const sourceTransform = getSourceTransform(conn.source);
    return sourceTransform.targetTables
      .map((table) => {
        const localTableName = `${conn.realm}_${table.tableName}`;
        const globalTableName = `${localTableNamePrefix}${table.tableName}`;
        return `${localTableName} as (SELECT * FROM ${globalTableName} WHERE _valid_from <= CAST("${time.toISOString()}" as TIMESTAMP) AND _valid_to > CAST("${time.toISOString()}" as TIMESTAMP))`;
      })
      .join(',\n');
  })}`;

  return `${preamble}\n${query}`;
};

const _queryWorkspace = async (
  workspaceId: string,
  time: Date,
  query: string
) => {
  const lake = await getDataLake(workspaceId, {
    enrichConnections: false,
  });
  if (!lake) {
    throw notFound('Data lake not found');
  }
  const client = await getDataLakeConnection(workspaceId);
  const preparedQuery = prepareQuery(
    workspaceId,
    lake.connections,
    time,
    query
  );
  // eslint-disable-next-line no-console
  console.warn('preparedQuery', preparedQuery);
  try {
    const [rows, , metadata] = await client.query(preparedQuery);
    if (!rows) {
      throw notFound('No rows found');
    }
    if (rows.length > MAX_COL_SIZE) {
      throw badData(
        `Result has too much data. Please use a WHERE or a LIMIT clause to filter the result.`
      );
    }
    const fields: Array<{ name?: string; type?: string }> =
      metadata?.schema?.fields ?? [];
    return prepareForJSON(
      rowsToColumns({ rows, fields }),
      Object.fromEntries(
        fields.map((field) => [field.name ?? '', field.type ?? ''])
      )
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw badRequest(`Failed to query workspace: ${(e as Error).message}`, {
      preparedQuery,
    });
  }
};

const unwantedColumns = new Set(['_valid_from', '_valid_to']);

const stripUnwantedColumns = (data: Record<string, Array<unknown>>) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !unwantedColumns.has(key))
  );
};

export const queryWorkspace = async (workspaceId: string, body: object) => {
  let parsedBody;
  try {
    parsedBody = createQueryRequestBodyParser().parse(body);
  } catch (e) {
    throw badRequest(`Invalid request body:${(e as Error).message}`);
  }
  return stripUnwantedColumns(
    await _queryWorkspace(
      workspaceId,
      new Date(parsedBody.time),
      parsedBody.query
    )
  );
};
