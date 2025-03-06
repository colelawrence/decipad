export interface AirbyteConnectionCreation {
  name: string;
  sourceId: string;
  destinationId: string;
  status: string;
}

export interface AirbyteConnection extends AirbyteConnectionCreation {
  connectionId: string;
}

export interface AirbyteSourceCreation {
  name: string;
  sourceDefinitionId: string;
  workspaceId: string;
  connectionConfiguration: object;
}

export interface AirbyteSource extends AirbyteSourceCreation {
  sourceId: string;
}

export interface AirbyteDestinationDefinition {
  destinationDefinitionId: string;
  name: string;
}

export interface AirbyteDestinationCreation {
  name: string;
  destinationDefinitionId: string;
  workspaceId: string;
  connectionConfiguration: object;
}

export interface AirbyteDestination extends AirbyteDestinationCreation {
  destinationId: string;
}

export interface AirbyteSourceDefinition {
  sourceDefinitionId: string;
  name: string;
}

export interface AirbyteSyncStatus {
  status: string;
  schedule: unknown;
  lastSyncStartedAt?: number;
  failure?: {
    failedAt: number;
    failureOrigin: string;
    failureType: string;
    message: string;
  };
}

export interface IAirbyteClient {
  getWorkspaceId: () => string;
  createConnection: (
    connection: AirbyteConnectionCreation
  ) => Promise<AirbyteConnection>;
  createSource: (source: AirbyteSourceCreation) => Promise<AirbyteSource>;
  updateSource: (
    sourceId: string,
    source: AirbyteSourceCreation
  ) => Promise<void>;
  createDestination: (
    destination: AirbyteDestinationCreation
  ) => Promise<AirbyteDestination>;
  listSources: (offset: number, limit: number) => Promise<AirbyteSource[]>;
  listDestinations: (
    offset: number,
    limit: number
  ) => Promise<AirbyteDestination[]>;
  listConnections: (
    offset: number,
    limit: number
  ) => Promise<AirbyteConnection[]>;
  listSourceDefinitions: (
    offset: number,
    limit: number
  ) => Promise<AirbyteSourceDefinition[]>;
  listDestinationDefinitions: (
    offset: number,
    limit: number
  ) => Promise<AirbyteDestinationDefinition[]>;
  checkConnectionHealth: (connectionId: AirbyteConnection) => Promise<void>;
  getSyncStatus: (connectionId: string) => Promise<AirbyteSyncStatus>;
}
