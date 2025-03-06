/* eslint-disable no-console */
import { BigQuery } from '@google-cloud/bigquery';
import type { DataRealm, DataSource } from '../types';
import { getSourceTransform } from './sources/getSourceTransform';
import { applyToTemplate } from '../utils/applyToTemplate';
import { googleBigQueryRootClient } from '../utils/googleBigQueryRootClient';
import { getLocalTargetTableName } from '../utils/getTargetTableName';
import { getLocalSourceTableName } from '../utils/getSourceTableName';

const createNormalizedTable = async (
  connection: BigQuery,
  fullTargetDataSetId: string,
  realm: DataRealm,
  source: DataSource,
  entityName: string
) => {
  const transform = getSourceTransform(source);
  const targetTableTransform =
    transform.getTargetTableTransformTemplate(entityName);
  const sourceIdColumn = transform.sourceIdColumn(entityName);

  const fullSourceTableNames = Object.fromEntries(
    transform.sourceTableNames.map((t) => [
      t,
      `${fullTargetDataSetId}.${getLocalSourceTableName(realm, source, t)}`,
    ])
  );

  const macros = {
    temporal_fields: `_airbyte_extracted_at as _valid_from,
  COALESCE(LEAD(_airbyte_extracted_at) OVER (PARTITION BY ${sourceIdColumn} ORDER BY _airbyte_extracted_at), CAST("9999-01-01" as TIMESTAMP))  as _valid_to`,
    temporal_fields_from_unnested: (value: string) => {
      console.warn('RENDERING TEMPORAL FIELDS FROM UNNESTED', value);
      return `_airbyte_extracted_at as _valid_from,
  COALESCE(LEAD(_airbyte_extracted_at) OVER (PARTITION BY ${sourceIdColumn}, ${value} ORDER BY _airbyte_extracted_at), CAST("9999-01-01" as TIMESTAMP))  as _valid_to`;
    },
  };

  const transformSql = applyToTemplate(targetTableTransform, {
    ...fullSourceTableNames,
    ...macros,
  });

  const fullTargetTableName = `${fullTargetDataSetId}.${getLocalTargetTableName(
    realm,
    entityName
  )}`;

  console.warn(
    `Creating materialized view ${fullTargetTableName} from ${transformSql}`
  );
  try {
    await connection.query(
      `CREATE MATERIALIZED VIEW ${fullTargetTableName} OPTIONS(max_staleness = INTERVAL "4" HOUR, allow_non_incremental_definition = true) AS ${transformSql} `
    );
    console.warn(`Created materialized view ${fullTargetTableName}`);
  } catch (err) {
    console.error('transformSql', transformSql);
    console.error('Caught error while creating materialized view', err);
    throw err;
  }
};

export const ensureNormalizedDestinationTable = async (
  fullTargetDataSetId: string,
  realm: DataRealm,
  source: DataSource,
  entityName: string
) => {
  const connection = await googleBigQueryRootClient();

  console.warn(
    `Dropping materialized view ${fullTargetDataSetId}.${getLocalTargetTableName(
      realm,
      entityName
    )}`
  );
  await connection.query(
    `DROP MATERIALIZED VIEW IF EXISTS \`${fullTargetDataSetId}.${getLocalTargetTableName(
      realm,
      entityName
    )}\``
  );
  return createNormalizedTable(
    connection,
    fullTargetDataSetId,
    realm,
    source,
    entityName
  );
};
