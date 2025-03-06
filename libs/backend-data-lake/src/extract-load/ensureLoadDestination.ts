import tables from '@decipad/tables';
import { airbyteClient } from './airByteClient';
import { dataLakeId } from '../utils/dataLakeId';
import { notAcceptable } from '@hapi/boom';
import { getDefined } from '@decipad/utils';
import { datalake } from '@decipad/backend-config';

const findWorkspaceLoadDestination = async (
  expectedDestinationName: string
) => {
  const client = airbyteClient();
  let finished = false;
  let offset = 0;
  while (!finished) {
    // eslint-disable-next-line no-await-in-loop
    const destinations = await client.listDestinations(offset, 100);
    const destination = destinations.find(
      (s) => s.name === expectedDestinationName
    );
    if (destination) {
      return destination;
    }
    if (destinations.length === 0 || destinations.length !== 100) {
      finished = true;
      break;
    }
    offset += 100;
  }
  return undefined;
};

const findDestinationDefinition = async (destinationType: string) => {
  const client = airbyteClient();
  let finished = false;
  let offset = 0;
  while (!finished) {
    // eslint-disable-next-line no-await-in-loop
    const definitions = await client.listDestinationDefinitions(offset, 100);
    const definition = definitions.find(
      (d) => d.name.toLowerCase() === destinationType
    );
    if (definition) {
      return definition.destinationDefinitionId;
    }
    if (definitions.length === 0 || definitions.length !== 100) {
      finished = true;
      break;
    }
    offset += 100;
  }
  return undefined;
};

const createDestination = async (
  workspaceId: string,
  expectedDestinationName: string
) => {
  const data = await tables();
  const lake = await data.datalakes.get({ id: dataLakeId(workspaceId) });
  if (lake?.state !== 'ready') {
    throw notAcceptable('Data lake is not ready');
  }
  const client = airbyteClient();
  const creds = datalake().rootCredentials;
  return client.createDestination({
    name: expectedDestinationName,
    destinationDefinitionId: getDefined(
      await findDestinationDefinition('bigquery'),
      `Could not find destination definition for destination of type bigquery`
    ),
    workspaceId: client.getWorkspaceId(),
    connectionConfiguration: {
      project_id: creds.project_id,
      dataset_id: dataLakeId(workspaceId),
      method: 'Standard',
      dataset_location: 'EU',
      credentials_json: JSON.stringify(creds),
      destinationType: 'bigquery',
    },
  });
};

export const ensureLoadDestination = async (workspaceId: string) => {
  const expectedDestinationName = `d_${workspaceId}`;
  let destination = await findWorkspaceLoadDestination(expectedDestinationName);
  if (!destination) {
    destination = await createDestination(workspaceId, expectedDestinationName);
  }
  return destination.destinationId;
};
