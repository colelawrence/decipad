/* eslint-disable no-console */
import { z } from 'zod';
import { ensureNormalizedDestinations } from '../transforms/ensureNormalizedDestinations';
import { parsing } from '../utils/parsing';
import { getExtractSourceDef } from '../extract-load/sources/getExtractSourceDef';
import { getSource } from '../types';
import { getBigQueryProjectId } from '../utils/getBigQueryProjectId';

const webhookSuccessfulSyncDataParser = parsing(
  z.object({
    data: z.object({
      dataSetId: z.string(),
      provider: z.string(),
    }),
  })
);

export const processCustomSyncNotification = async (
  body: Record<string, unknown>
) => {
  const {
    data: { dataSetId, provider },
  } = webhookSuccessfulSyncDataParser(body);

  console.warn('processSuccessfulSyncNotification', { dataSetId, provider });

  const { realm } = getExtractSourceDef(getSource(provider));

  console.warn('processCustomSyncNotification: data set id', dataSetId);
  console.warn('processCustomSyncNotification: realm', realm);
  console.warn('processCustomSyncNotification: provider', provider);

  await ensureNormalizedDestinations(
    `${getBigQueryProjectId()}.${dataSetId}`,
    realm,
    provider
  );
};
