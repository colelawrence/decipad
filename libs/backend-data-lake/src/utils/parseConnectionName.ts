import { badRequest } from '@hapi/boom';

export const parseConnectionName = (
  name: string
): [workspaceId: string, provider: string] => {
  const parts = name.match(/^c_(.+)_(.+)$/);
  if (!parts) {
    throw badRequest(`Invalid connection name ${name}`);
  }

  const [, workspaceId, provider] = parts;
  if (!workspaceId || !provider) {
    throw badRequest(`Invalid connection name ${name}`);
  }

  return [workspaceId, provider];
};
