import type {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
} from '@decipad/backendtypes';
import tables, { timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';

type SaveExternalKeyOptions = {
  externalDataSource: ExternalDataSourceRecord;
  userId: string;
  accessToken: string;

  tokenType?: string;
  scope?: string;
  refreshToken?: string;
  expiresIn?: string;
};

export async function saveExternalKey({
  externalDataSource,
  userId,
  tokenType,
  scope,
  accessToken,
  refreshToken,
}: SaveExternalKeyOptions) {
  const data = await tables();

  const keyRecord: ExternalKeyRecord = {
    id: nanoid(),
    createdAt: timestamp(),

    resource_uri: externalDataSource.id,

    provider: externalDataSource.provider,
    token_type: tokenType,
    createdBy: userId,
    access_token: accessToken,
    refresh_token: refreshToken,

    scope,
  };

  await data.externaldatasourcekeys.create(keyRecord);
}
