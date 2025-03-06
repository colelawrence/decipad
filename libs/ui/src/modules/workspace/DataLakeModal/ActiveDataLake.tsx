import { ModalTitle } from '../../../shared/molecules/Modal/styles';
import { FC } from 'react';
import { DataLakeConnection } from './DataLakeConnection';
import { NewDataLakeConnection } from './NewDataLakeConnection';
import { css } from '@emotion/react';

export interface DataLakeDataConnection {
  realm: string;
  source: string;
  state: 'pending' | 'ready' | 'inactive';
  icon: string;
  syncStatus?: {
    status: string;
    schedule?: any;
    lastSyncStartedAt?: number;
    failure?: {
      failedAt: number;
      failureOrigin: string;
      failureType: string;
      message: string;
    };
  };
}

export interface DataLakePossibleDataConnection {
  sourceType: string;
  displayName: string;
  description: string;
  icon: string;
  configSchema: Record<string, unknown>;
  configInstructionsMarkdown: string;
}

const availableConnectionsStyles = css({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '12px',
});

export interface ActiveDataLakeProps {
  dataLake: {
    state: 'pending' | 'ready' | 'inactive';
    connections?: DataLakeDataConnection[];
    availableConnections?: DataLakePossibleDataConnection[];
  };
  newConnectionAction: (
    connection: DataLakePossibleDataConnection['sourceType']
  ) => Promise<unknown>;
  editConnectionAction: (
    connection: DataLakeDataConnection['realm']
  ) => Promise<unknown>;
}

export const ActiveDataLake: FC<ActiveDataLakeProps> = ({
  dataLake: { connections, availableConnections },
  newConnectionAction,
  editConnectionAction,
}) => {
  return (
    <>
      {connections?.length ? (
        <>
          <ModalTitle>Connections</ModalTitle>
          {connections?.map((conn) => (
            <DataLakeConnection
              editAction={() => editConnectionAction(conn.realm)}
              connection={conn}
              key={conn.realm}
            />
          ))}
        </>
      ) : null}

      {availableConnections?.length ? (
        <div css={availableConnectionsStyles}>
          <ModalTitle>Add a connection</ModalTitle>
          {availableConnections?.map((conn) => (
            <NewDataLakeConnection
              key={conn.sourceType}
              connection={conn}
              newConnectionAction={newConnectionAction}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
