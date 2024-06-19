import { resource } from '@decipad/backend-resources';
import type {
  ExternalDataSource,
  GraphqlContext,
} from '@decipad/graphqlserver-types';
import tables from '@decipad/tables';
import { externalDataResource } from './externalDataResource';

const workspaces = resource('workspace');

/**
 * Use this when you are creating a connection but don't yet know the name
 * We do this when using OAuth, because we must create the external data before.
 * And only then update the name
 */
const TEMP_CONNECTION_NAME = 'TEMP_CONNECTION';

export async function getExternalDataWorkspace(
  workspaceId: string,
  context: GraphqlContext
): Promise<Array<ExternalDataSource>> {
  await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'READ',
  });

  const data = await tables();

  const { Items } = await data.externaldatasources.query({
    IndexName: 'byWorkspace',
    KeyConditionExpression: 'workspace_id = :workspace_id',
    ExpressionAttributeValues: {
      ':workspace_id': workspaceId,
    },
  });

  return Items.filter((i) => i.name !== TEMP_CONNECTION_NAME).map(
    externalDataResource.toGraphql
  );
}
