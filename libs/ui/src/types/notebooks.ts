export type Notebook = {
  id: string;
  name: string;
  workspaceId?: string | null;
  isPublic?: boolean | null;
  icon?: string | null;
  createdAt: number;
  sectionId?: string | null;
  archived?: boolean | null;
  myPermissionType?: string | null;
  status?: string | null;
};
