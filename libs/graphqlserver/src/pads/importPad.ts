import { GraphqlContext, ID, PadRecord } from '@decipad/backendtypes';
import { importNotebook } from '@decipad/services/notebooks';
import { resource } from '@decipad/backend-resources';
import { ForbiddenError } from 'apollo-server-lambda';

const workspaces = resource('workspace');

export const importPad = async (
  _: unknown,
  { workspaceId, source }: { workspaceId: ID; source: string },
  context: GraphqlContext
): Promise<PadRecord> => {
  const { user } = await workspaces.expectAuthorizedForGraphql({
    context,
    recordId: workspaceId,
    minimumPermissionType: 'WRITE',
  });
  if (!user) {
    throw new ForbiddenError('not authenticated');
  }

  return importNotebook({
    workspaceId,
    source,
    user,
  });
};
