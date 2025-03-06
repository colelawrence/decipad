export const dataLakeId = (workspaceId: string) =>
  `workspaces_${workspaceId.replaceAll('-', '_')}`;
