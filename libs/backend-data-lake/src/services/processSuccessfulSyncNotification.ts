/* eslint-disable no-console */
import { z } from 'zod';
import { parseConnectionName } from '../utils/parseConnectionName';
import { ensureNormalizedDestinations } from '../transforms/ensureNormalizedDestinations';
import { parsing } from '../utils/parsing';
import { getExtractSourceDef } from '../extract-load/sources/getExtractSourceDef';
import { getSource } from '../types';
import { dataLakeId } from '../utils/dataLakeId';
import { getBigQueryProjectId } from '../utils/getBigQueryProjectId';

const webhookSuccessfulSyncDataParser = parsing(
  z.object({
    data: z.object({
      connection: z.object({
        name: z.string(),
      }),
    }),
  })
);

export const processSuccessfulSyncNotification = async (
  body: Record<string, unknown>
) => {
  const {
    data: { connection },
  } = webhookSuccessfulSyncDataParser(body);

  console.warn('processSuccessfulSyncNotification', connection);

  if (connection.name === 'Connection') {
    // Webhook test connection
    return;
  }

  const [workspaceId, provider] = parseConnectionName(connection.name);
  const { realm } = getExtractSourceDef(getSource(provider));

  console.warn(
    'processSuccessfulSyncNotification: connection name',
    connection.name
  );
  console.warn('processSuccessfulSyncNotification: workspaceId', workspaceId);
  console.warn('processSuccessfulSyncNotification: realm', realm);
  console.warn('processSuccessfulSyncNotification: provider', provider);

  await ensureNormalizedDestinations(
    `${getBigQueryProjectId()}.${dataLakeId(workspaceId)}`,
    realm,
    provider
  );
};
