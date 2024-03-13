import { thirdParty } from '@decipad/backend-config';
import {
  ExternalDataSourceRecord,
  ExternalKeyRecord,
  User,
} from '@decipad/backendtypes';
import tables, { timestamp } from '@decipad/tables';
import { nanoid } from 'nanoid';

type SaveExternalKeyOptions = {
  resourceType: 'pads' | 'workspaces';
  externalDataSource: ExternalDataSourceRecord;
  user: User;
  tokenType: 'Bearer';
  accessToken: string;

  scope?: string;
  refreshToken?: string;
  expiredAt?: string;
};

export async function saveExternalKey({
  resourceType,
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

    resource_uri: `/${resourceType}/${externalDataSource.padId}`,
    provider: externalDataSource.provider,
    // eslint-disable-next-line camelcase
    token_type: tokenType,
    createdBy: user.id,
    scope,
    access_token: accessToken,
    refresh_token: refreshToken,
  };

  keyRecord.expiresAt =
    timestamp() +
    (Number(expiredAt) || thirdParty().defaultTokenExpirationSeconds);

  await data.externaldatasourcekeys.create(keyRecord);
}
