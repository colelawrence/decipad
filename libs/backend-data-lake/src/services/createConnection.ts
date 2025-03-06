/* eslint-disable no-param-reassign */
import tables from '@decipad/tables';
import { dataLakeId } from '../utils/dataLakeId';
import { badRequest, notFound } from '@hapi/boom';
import { DataRealm, DataSource, getSource } from '../types';
import { ensureExtractSource } from '../extract-load/ensureExtractSource';
import { ensureLoadDestination } from '../extract-load/ensureLoadDestination';
import { ensureConnection } from '../extract-load/ensureConnection';
import { DataLakeDataConnection } from '@decipad/backendtypes';

const sourceTypeToRealm = (sourceType: DataSource): DataRealm => {
  switch (sourceType) {
    case 'harvest':
      return 'timetracking';
    case 'hubspot':
      return 'crm';
    case 'xero':
      return 'accounting';
  }
};

export const createConnection = async (
  workspaceId: string,
  _sourceType: string,
  configuration: object
) => {
  const sourceType = getSource(_sourceType);
  const data = await tables();
  const lakeId = dataLakeId(workspaceId);
  const lake = await data.datalakes.get({ id: lakeId });
  if (!lake) {
    throw notFound('Data lake not found');
  }
  if (lake.state !== 'ready') {
    throw badRequest('Data lake not ready');
  }

  const realm = sourceTypeToRealm(sourceType);

  if (
    lake.connections?.find((c) => c.realm === realm && c.source !== sourceType)
  ) {
    throw badRequest(`Connection for type ${realm} already exists`);
  }

  const sourceId = await ensureExtractSource(
    workspaceId,
    sourceType,
    configuration
  );
  const destinationId = await ensureLoadDestination(workspaceId);
  await ensureConnection(workspaceId, sourceType, sourceId, destinationId);
  await data.datalakes.withLock(lakeId, (dataLake) => {
    if (!dataLake) {
      throw notFound('Data lake not found');
    }
    if (!dataLake.connections) {
      dataLake.connections = [];
    }
    const connection = dataLake.connections.find(
      (c) => c.source === sourceType
    );
    if (connection) {
      connection.state = 'ready';
    } else {
      dataLake.connections.push({
        realm,
        source: sourceType,
        state: 'ready',
        syncState: 'idle',
      } as DataLakeDataConnection);
    }
    return dataLake;
  });
};
