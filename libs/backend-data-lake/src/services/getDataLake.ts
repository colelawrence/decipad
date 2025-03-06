import tables from '@decipad/tables';
import { dataLakeId } from '../utils/dataLakeId';
import { availableConnections } from '../extract-load/availableConnections';
import { DataLakeDataConnection } from '@decipad/backendtypes';
import {
  ExtractSourceDefinition,
  getExtractSourceDef,
} from '../extract-load/sources/getExtractSourceDef';
import { findExtractSource } from '../extract-load/findExtractSource';
import { airbyteClient } from '../extract-load/airByteClient';
import { AirbyteSyncStatus } from '../extract-load/types';
import { findConnection } from '../extract-load/findConnection';
import { notFound } from '@hapi/boom';

export type EnrichedDataLakeDataConnection = DataLakeDataConnection &
  ExtractSourceDefinition & {
    config?: object;
    syncStatus: AirbyteSyncStatus;
  };

const enrichConnection = async (
  workspaceId: string,
  connection: DataLakeDataConnection
): Promise<EnrichedDataLakeDataConnection> => {
  const sourceDef = getExtractSourceDef(connection.source);
  const extractSource = await findExtractSource(workspaceId, connection.source);
  const extractLoadConnection = await findConnection(
    workspaceId,
    connection.source
  );
  if (!extractLoadConnection) {
    throw notFound('Extract load connection not found');
  }
  const syncStatus = await airbyteClient().getSyncStatus(
    extractLoadConnection.connectionId
  );
  return {
    ...sourceDef,
    ...connection,
    config: extractSource?.connectionConfiguration,
    syncStatus,
  };
};

const enrichConnections = async (
  workspaceId: string,
  connections: DataLakeDataConnection[]
): Promise<EnrichedDataLakeDataConnection[]> => {
  return Promise.all(connections.map((c) => enrichConnection(workspaceId, c)));
};

export interface GetDataLakeOptions {
  enrichConnections?: boolean;
}

export const getDataLake = async (
  workspaceId: string,
  { enrichConnections: enrichConnectionsOption = true }: GetDataLakeOptions = {}
) => {
  const data = await tables();
  let lake = await data.datalakes.get({ id: dataLakeId(workspaceId) });
  if (!lake) {
    return undefined;
  }
  if (lake.state === 'ready' && !lake.credentials) {
    lake = {
      ...lake,
      state: 'pending',
    };
    await data.datalakes.put(lake);
  }
  return {
    state: lake.state,
    connections: enrichConnectionsOption
      ? await enrichConnections(workspaceId, lake.connections ?? [])
      : lake.connections ?? [],
    availableConnections: availableConnections({ exclude: lake.connections }),
  };
};
