import { getLocalNotebookUpdates } from '@decipad/docsync';

type ExportCallback = () => Promise<void>;

const forceDownload = (notebookId: string, file: Blob) => {
  // Create blob link to download
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${notebookId}.json`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode?.removeChild(link);
};

const remoteExportNotebookWithUpdates = async (
  notebookId: string,
  updates?: Uint8Array
): Promise<Blob> => {
  const resp = await fetch(
    `/api/pads/${encodeURIComponent(notebookId)}/export`,
    {
      method: 'POST',
      body: updates,
    }
  );
  return resp.blob();
};

export const exportNotebook = (notebookId: string): ExportCallback => {
  return async () => {
    const updates = await getLocalNotebookUpdates(notebookId);
    const file = await remoteExportNotebookWithUpdates(notebookId, updates);

    forceDownload(notebookId, file);
  };
};
