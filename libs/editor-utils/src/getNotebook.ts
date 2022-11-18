import { fetch } from '@decipad/fetch';

interface Notebook {
  isPublic?: boolean;
}

interface NotebookProps {
  hasAccess: boolean;
  exists: boolean;
  isPublic?: boolean;
}

export const getNotebook = async (
  notebookId: string
): Promise<NotebookProps> => {
  const resp = await fetch(`/api/pads/${encodeURIComponent(notebookId)}`);
  if (resp.status === 403) {
    return {
      hasAccess: false,
      exists: true,
      isPublic: false,
    };
  }
  if (resp.status === 404) {
    return {
      hasAccess: false,
      exists: false,
      isPublic: false,
    };
  }
  const notebook = (await resp.json()) as Notebook;
  if (!notebook) {
    return { exists: false, hasAccess: false, isPublic: false };
  }
  return { exists: true, hasAccess: true, isPublic: !!notebook.isPublic };
};
