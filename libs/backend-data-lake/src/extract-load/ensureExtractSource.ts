import { dequal, getDefined } from '@decipad/utils';
import { DataSource } from '../types';
import { airbyteClient } from './airByteClient';
import { findExtractSource } from './findExtractSource';
import { getExtractSourceName } from './getExtractSourceName';

const findExtractSourceDefinition = async (sourceType: DataSource) => {
  const client = airbyteClient();
  let finished = false;
  let offset = 0;

  while (!finished) {
    // eslint-disable-next-line no-await-in-loop
    const sourceDefs = await client.listSourceDefinitions(offset, 100);
    const sourceDef = sourceDefs.find(
      (d) => d.name.toLowerCase() === sourceType
    );
    if (sourceDef) {
      return sourceDef.sourceDefinitionId;
    }
    if (sourceDefs.length === 0 || sourceDefs.length !== 100) {
      finished = true;
      break;
    }
    offset += 100;
  }
  return undefined;
};

const createExtractSource = async (
  expectedSourceName: string,
  sourceType: DataSource,
  connectionConfiguration: object
): Promise<string> => {
  const client = airbyteClient();
  const source = await client.createSource({
    workspaceId: client.getWorkspaceId(),
    sourceDefinitionId: getDefined(
      await findExtractSourceDefinition(sourceType),
      `Could not find source definition for source of type ${sourceType}`
    ),
    name: expectedSourceName,
    connectionConfiguration,
  });
  return source.sourceId;
};

const updateExtractSource = async (
  sourceId: string,
  expectedSourceName: string,
  sourceType: DataSource,
  connectionConfiguration: object
): Promise<void> => {
  const client = airbyteClient();
  await client.updateSource(sourceId, {
    workspaceId: client.getWorkspaceId(),
    sourceDefinitionId: getDefined(
      await findExtractSourceDefinition(sourceType),
      `Could not find source definition for source of type ${sourceType}`
    ),
    name: expectedSourceName,
    connectionConfiguration,
  });
};

export const ensureExtractSource = async (
  workspaceId: string,
  sourceType: DataSource,
  configuration: object
): Promise<string> => {
  // check if source exists
  // if not, create it
  const expectedSourceName = getExtractSourceName(workspaceId, sourceType);
  const source = await findExtractSource(workspaceId, sourceType);
  if (source) {
    if (!dequal(source.connectionConfiguration, configuration)) {
      await updateExtractSource(
        source.sourceId,
        expectedSourceName,
        sourceType,
        configuration
      );
    } else {
      return source.sourceId;
    }
  }
  // create source
  return createExtractSource(expectedSourceName, sourceType, configuration);
};
