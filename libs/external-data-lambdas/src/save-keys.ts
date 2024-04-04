import { thirdParty } from '@decipad/backend-config';
import type {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
  User,
} from '@decipad/backendtypes';
import tables, { timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';

type SaveExternalKeyOptions = {
  externalDataSource: ExternalDataSourceRecord;
  user: User;
  tokenType: 'Bearer';
  accessToken: string;

  scope?: string;
  refreshToken?: string;
  expiredAt?: string;
};

export async function saveExternalKey({
  externalDataSource,
  user,
  tokenType,
  scope,
  accessToken,
  refreshToken,
  expiredAt,
}: SaveExternalKeyOptions) {
  const data = await tables();

  const keyRecord: ExternalKeyRecord = {
    id: nanoid(),
    createdAt: timestamp(),

    resource_uri: externalDataSource.id,

    provider: externalDataSource.provider,
    token_type: tokenType,
    createdBy: user.id,
    access_token: accessToken,
    refresh_token: refreshToken,

    scope,
  };

  keyRecord.expiresAt =
    timestamp() +
    (Number(expiredAt) || thirdParty().defaultTokenExpirationSeconds);

  await data.externaldatasourcekeys.create(keyRecord);
}
