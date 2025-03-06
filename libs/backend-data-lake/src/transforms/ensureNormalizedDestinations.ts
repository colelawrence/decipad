/* eslint-disable no-await-in-loop */
import { getSourceTransform } from './sources/getSourceTransform';
import { getLocalTargetTableName } from '../utils/getTargetTableName';
import { ensureNormalizedDestinationTable } from './ensureNormalizedDestinationTable';
import { getRealm } from '../types';
import { googleBigQueryRootClient } from '../utils/googleBigQueryRootClient';

/* eslint-disable no-console */
export const ensureNormalizedDestinations = async (
  fullBigTableDataSetId: string,
  realm: string,
  provider: string
) => {
  const sourceTransform = getSourceTransform(provider);

  const client = await googleBigQueryRootClient();

  for (const targetTable of sourceTransform.targetTables) {
    const fullTargetTableName = `${fullBigTableDataSetId}.${getLocalTargetTableName(
      getRealm(realm),
      targetTable.tableName
    )}`;

    const columnNames = [
      ...targetTable.columns.map((c) => c.name),
      '_valid_from',
      '_valid_to',
    ];

    try {
      const query = `SELECT ${columnNames.join(
        ', '
      )} from \`${fullTargetTableName}\` LIMIT 1`;
      console.log('Checking if table exists', query);
      await client.query(query);
      console.log('Table exists and contains all columns', fullTargetTableName);
      continue;
    } catch (error) {
      console.error('Caught error while checking if table exists', error);
      console.warn('Table or columns not found, going to create it');
    }

    // now, we need to ensure that every column in targetTable.columns exists in res
    // we need to update the table
    await ensureNormalizedDestinationTable(
      fullBigTableDataSetId,
      sourceTransform.realm,
      sourceTransform.source,
      targetTable.tableName
    );
  }
};
