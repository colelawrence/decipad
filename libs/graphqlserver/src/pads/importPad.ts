import { GraphqlContext, ID, PadRecord } from '@decipad/backendtypes';
import { importNotebook } from '@decipad/services/notebooks';
import { isAuthenticatedAndAuthorized } from '../authorization';

export const importPad = async (
  _: unknown,
  { workspaceId, source }: { workspaceId: ID; source: string },
  context: GraphqlContext
): Promise<PadRecord> => {
  const workspaceResource = `/workspaces/${workspaceId}`;
  const user = await isAuthenticatedAndAuthorized(
    workspaceResource,
    context,
    'WRITE'
  );

  return importNotebook({
    workspaceId,
    source,
    user,
  });
};
