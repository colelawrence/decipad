import { GraphqlContext, ID, PadRecord } from '@decipad/backendtypes';
import { importDoc } from '@decipad/services/notebooks';
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

  return importDoc({ workspaceId, source, user });
};
