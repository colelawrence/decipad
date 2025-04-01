import { DatalakeRecord } from '@decipad/backendtypes';
import { dataLakeId } from '../utils/dataLakeId';

export const fakeFullDatalakeRecord = (workspaceId: string): DatalakeRecord => {
  return {
    id: dataLakeId(workspaceId),
    _version: 0,
    state: 'ready',
    credentials: process.env.DATALAKE_GOOGLE_ROOT_SERVICE_CREDENTIALS,
    connections: [
      // one connection for each realm: xero, hubspot, harvest
      {
        connectionId: 'xero',
        realm: 'accounting',
        source: 'xero',
        state: 'ready',
        syncState: 'synced',
      },
      // hubspot
      {
        connectionId: 'hubspot',
        realm: 'crm',
        source: 'hubspot',
        state: 'ready',
        syncState: 'synced',
      },
      // harvest
      {
        connectionId: 'harvest',
        realm: 'timetracking',
        source: 'harvest',
        state: 'ready',
        syncState: 'synced',
      },
    ],
  } satisfies DatalakeRecord;
};
