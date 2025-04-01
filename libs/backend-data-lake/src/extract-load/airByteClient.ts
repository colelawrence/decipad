/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import qs from 'qs';
import { z } from 'zod';
import { datalake as datalakeConfig } from '@decipad/backend-config';
import { once } from '@decipad/utils';
import type {
  AirbyteConnection,
  AirbyteConnectionCreation,
  AirbyteDestinationCreation,
  AirbyteSourceCreation,
  AirbyteSyncStatus,
  IAirbyteClient,
} from './types';
import { badRequest, expectationFailed, notFound } from '@hapi/boom';
import { tryJsonParse } from '../utils/tryJsonParse';
import { massageSourceDefinition } from './massageSourceDefinition';

const createConnectionHealthResponseParser = once(() =>
  z.object({
    status: z.string(),
    message: z.string().optional(),
  })
);

const createSyncStatusParser = once(() =>
  z.array(
    z.object({
      connectionSyncStatus: z.string(),
      scheduleData: z.unknown(),
      lastSyncJobCreatedAt: z.number().optional(),
      failureReason: z
        .object({
          failureOrigin: z.string(),
          failureType: z.string(),
          externalMessage: z.string(),
          timestamp: z.number(),
        })
        .optional(),
    })
  )
);

const processErrorResponse = async (
  response: Response,
  errorMessage: string
): Promise<Error> => {
  const responseBody = await response.text();
  console.warn('Airbyte error response', responseBody);
  const responseJson = tryJsonParse(responseBody);
  if (
    responseJson &&
    typeof responseJson === 'object' &&
    'message' in responseJson
  ) {
    return badRequest(`${errorMessage}: ${responseJson.message}`);
  }
  return badRequest(`${errorMessage}: ${response.statusText}`);
};

// Unfortunately, there is no official Airbyte SDK for Node.js, so we need to use the REST API directly.
// This is a simple client that can be used to manage connections, sources, and destinations.
class AirbyteClient implements IAirbyteClient {
  private async getToken() {
    const { airbyteClientId, airbyteClientSecret, airbyteUrl } =
      datalakeConfig();
    const tokenRequestBody = JSON.stringify({
      client_id: airbyteClientId,
      client_secret: airbyteClientSecret,
      grant_type: 'client_credentials',
    });
    // get api token
    const tokenUrl = `${airbyteUrl}/api/v1/applications/token`;
    let response: Response;
    try {
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: tokenRequestBody,
      });
    } catch (error) {
      console.error('Error fetching token from', tokenUrl, error);
      throw error;
    }

    if (!response.ok) {
      console.error('Error fetching token from', tokenUrl, response);
      throw await processErrorResponse(response, 'Failed to get token');
    }

    return ((await response.json()) as { access_token: string }).access_token;
  }

  private async request(method: string, path: string, body?: object) {
    const token = await this.getToken();
    const { airbyteUrl } = datalakeConfig();
    console.log('AIRBYTE URL', airbyteUrl);
    const encodedBody =
      (method !== 'GET' && body && JSON.stringify(body)) || undefined;
    console.warn('encodedBody', encodedBody);
    const encodedPath =
      method === 'GET' && body ? `${path}?${qs.stringify(body)}` : path;
    const fullPath = `${airbyteUrl}/api/v1/${encodedPath}`;
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(fullPath, {
      method,
      body: encodedBody,
      headers,
    });
    if (!response.ok) {
      throw await processErrorResponse(response, 'Failed: ');
    }

    return response.json();
  }

  async createConnection(connection: AirbyteConnectionCreation) {
    return this.request('POST', 'connections/create', connection);
  }

  async listSources(offset = 0, limit = 100) {
    const workspaceId = this.getWorkspaceId();
    return (
      await this.request('POST', 'sources/list', {
        offset,
        limit,
        workspaceId,
      })
    ).sources;
  }

  async listDestinations(offset = 0, limit = 100) {
    const workspaceId = this.getWorkspaceId();
    return (
      await this.request('POST', 'destinations/list', {
        offset,
        limit,
        workspaceId,
      })
    ).destinations;
  }

  async listConnections(offset = 0, limit = 100) {
    const workspaceId = this.getWorkspaceId();
    return (
      await this.request('POST', 'connections/list', {
        offset,
        limit,
        workspaceId,
      })
    ).connections;
  }

  async listSourceDefinitions(offset = 0, limit = 100) {
    const workspaceId = this.getWorkspaceId();
    return (
      await this.request('POST', 'source_definitions/list', {
        workspaceId,
        offset,
        limit,
      })
    ).sourceDefinitions;
  }

  async listDestinationDefinitions(offset = 0, limit = 100) {
    const workspaceId = this.getWorkspaceId();
    return (
      await this.request('POST', 'destination_definitions/list', {
        workspaceId,
        offset,
        limit,
      })
    ).destinationDefinitions;
  }

  getWorkspaceId() {
    return datalakeConfig().airbyteWorkspaceId;
  }

  async createSource(source: AirbyteSourceCreation) {
    return this.request(
      'POST',
      'sources/create',
      massageSourceDefinition(source)
    );
  }

  async updateSource(sourceId: string, source: AirbyteSourceCreation) {
    return this.request('POST', `sources/update`, {
      sourceId,
      ...massageSourceDefinition(source),
    });
  }

  async createDestination(destination: AirbyteDestinationCreation) {
    return this.request('POST', 'destinations/create', destination);
  }

  async checkSourceConnectionHealth(connection: AirbyteConnection) {
    const response = await this.request('POST', `sources/check_connection`, {
      sourceId: connection.sourceId,
    });
    console.warn('response', response);
    const parsedResponse =
      createConnectionHealthResponseParser().parse(response);
    if (parsedResponse.status !== 'succeeded') {
      throw expectationFailed(
        `Source connection failed: ${parsedResponse.message}`
      );
    }
  }

  async checkDestinationConnectionHealth(connection: AirbyteConnection) {
    const response = await this.request(
      'POST',
      `destinations/check_connection`,
      {
        destinationId: connection.destinationId,
      }
    );
    console.warn('response', response);
    const parsedResponse =
      createConnectionHealthResponseParser().parse(response);
    if (parsedResponse.status !== 'succeeded') {
      throw expectationFailed(
        `Destination connection failed: ${parsedResponse.message}`
      );
    }
  }

  async checkConnectionHealth(connection: AirbyteConnection) {
    await this.checkSourceConnectionHealth(connection);
    await this.checkDestinationConnectionHealth(connection);
  }

  async getSyncStatus(connectionId: string): Promise<AirbyteSyncStatus> {
    const response = await this.request('POST', `connections/status`, {
      connectionIds: [connectionId],
    });
    const parsedResponse = createSyncStatusParser().parse(response);
    if (parsedResponse.length === 0) {
      throw notFound('Connection not found');
    }
    const syncStatus = parsedResponse[0];
    return {
      status: syncStatus.connectionSyncStatus,
      schedule: syncStatus.scheduleData,
      lastSyncStartedAt: syncStatus.lastSyncJobCreatedAt,
      failure: syncStatus.failureReason && {
        failedAt: syncStatus.failureReason.timestamp,
        failureOrigin: syncStatus.failureReason.failureOrigin,
        failureType: syncStatus.failureReason.failureType,
        message: syncStatus.failureReason.externalMessage,
      },
    };
  }
}

export const airbyteClient = (): IAirbyteClient => new AirbyteClient();
