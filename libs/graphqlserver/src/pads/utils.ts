import tables from '@decipad/tables';

export const isNotebookOnPremiumWorkspace = async (
  workspaceId?: string
): Promise<boolean> => {
  if (!workspaceId) {
    return false;
  }

  const data = await tables();
  const workspace = await data.workspaces.get({ id: workspaceId });

  return !!workspace?.isPremium;
};
