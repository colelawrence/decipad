import stringify from 'json-stringify-safe';
import { pingDatabase, runUserQuery } from '@decipad/backend-external-db';
import { getDefined } from '@decipad/utils';
import { app } from '@decipad/config';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { resource } from '@decipad/backend-resources';
import { getAuthenticatedUser } from '@decipad/services/authentication';
import handle from '../handle';
import { ExternalDataSourceRecord } from '../../types';

const notebook = resource('notebook');

const fetchExternalDataSource = async (
  id: string
): Promise<ExternalDataSourceRecord | undefined> => {
  const data = await tables();
  return data.externaldatasources.get({ id });
};

export const handler = handle(async (event) => {
  const externalDataSourceId = getDefined(getDefined(event.pathParameters).id);
  const externalDataSource = await fetchExternalDataSource(
    externalDataSourceId
  );
  if (!externalDataSource) {
    throw Boom.notFound(
      `Could not find external data source with id ${externalDataSourceId}`
    );
  }

  await notebook.expectAuthorized({
    minimumPermissionType: 'READ',
    recordId: getDefined(externalDataSource?.padId),
    user: await getAuthenticatedUser(event),
  });

  let { body: requestBody } = event;
  if (event.isBase64Encoded && requestBody) {
    requestBody = Buffer.from(requestBody, 'base64').toString('utf8');
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: stringify(
      requestBody
        ? await runUserQuery(externalDataSource.externalId, requestBody)
        : {
            url: app().urlBase + event.rawPath,
            ...(await pingDatabase(externalDataSource.externalId)),
          }
    ),
  };
});
